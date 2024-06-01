from flask import Flask, jsonify,request, send_file
from flask_socketio import SocketIO
from client import ClientSocket
from flask_sqlalchemy import SQLAlchemy
from engineio.payload import Payload
from client_thread import ClientThread
from count_object_detection import CountObjectDetection
from utils import filter_objet_by_score, setup_logger
from flask_cors import CORS
from models.schema import *
from sqlalchemy.orm import sessionmaker
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from datetime import datetime
import json
import os
import cv2


UPLOAD_FOLDER = 'uploads'
ID_IMG_FOLDER = 'identification'


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'this_is_a_development_server'
app.config['JWT_SECRET_KEY'] = 'this_is_a_development_server'  # Change this to a secure secret key
Payload.max_decode_packets = 100
socketio = SocketIO(app, cors_allowed_origins='*')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db' 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ID_IMG_FOLDER'] = ID_IMG_FOLDER
jwt = JWTManager(app)
db = SQLAlchemy()
db.init_app(app)
engine =''

if not os.path.exists('database.db'):
    if not os.path.exists(ID_IMG_FOLDER):
        os.mkdir(ID_IMG_FOLDER)
    with app.app_context():
	    engine = create_database()

connected_clients = {}
face_client = None

@socketio.on('connect')
def handle_connect():
    print('New client connected : ' + str(request.sid))

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected: ' + str(request.sid))
    #delete connected_client
    keys = []
    for key, value in connected_clients.items():
        if (value.get_sid() == request.sid):
            keys.append(key)
    for key in keys:
         del connected_clients[key]
         tag = "microservice_disconnected"
         data = {
             "microservice":key, 
             "message":key.lower() + " is disconnected", 
         }
         if "WEB_CLIENT" in connected_clients:
            thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag=tag, data=data)
            thread_web_client.start()
    
    print(connected_clients)


# identifier le microservice
@socketio.on('whoiam')
def handle_client_name(name):
    global face_client,connected_clients
    client_socket = ClientSocket(request.sid, name)
    connected_clients[name] = client_socket
    if name == "FACE_RECOGNITION":
        face_client = client_socket
    if name == "MOBILE":
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="mobile_device_connected", data="Mobile device is connected")
        thread_web_client.start()

    socketio.emit('from_server', 
				  {'code': 'connection_successful', 'message': 'Connected to the server'}, 
				  room=request.sid)
    print(connected_clients)
    


# camera from mobile
@socketio.on('transfer')
def handle_camera_mobile(frames_bytes):
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="phone_camera", data=frames_bytes)
        thread_web_client.start()
    
    if "TEXT_EXTRACTION" in connected_clients:
        thread_text_extraction = ClientThread(socketio=socketio, client=connected_clients["TEXT_EXTRACTION"],  tag="phone_camera", data=frames_bytes)
        thread_text_extraction.start()

@socketio.on('open_phone_camera')
def handle_open_phone_camera(data):
    if "MOBILE" in connected_clients:
        thread_mobile_device = ClientThread(socketio=socketio, client=connected_clients["MOBILE"],  tag="from_server", data={'code': 'open_camera', 'message': 'open camera'})
        thread_mobile_device.start()
    else:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="mobile_disconnected", data="Mobile disconnected")
        thread_web_client.start()


        


@socketio.on('object_detection')
def handle_object_detection(predictions):
    filtered_predictions = filter_objet_by_score(predictions)
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="object_label", data=filtered_predictions)
        thread_web_client.start()
        thread_web_client.join()

@socketio.on('object_detection_text_extraction')



# webcam pc
@socketio.on('webcam_stream')
def handle_webcam(data):
    if "FACE_RECOGNITION" in connected_clients:
        thread_face_recognition = ClientThread(socketio=socketio, client=face_client, tag="webcam", data=data)
        thread_face_recognition.start()


@socketio.on('face_recognition')
def handle_face_recognition(frames_bytes):
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="face_recognition", data=frames_bytes)
        thread_web_client.start()

@socketio.on('face_result')
def handle_face_result(results):
    json_result = json.dumps(results)
    if "WEB_CLIENT":
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="face_result", data=json_result)
        thread_web_client.start()


#analyse environnment
@socketio.on('analyze_environnment')
def handle_analyze_environnment(predictions):
    count_cheating_objects = CountObjectDetection(data=predictions, socketio=socketio,client=connected_clients)
    count_cheating_objects.start()


# text detection
@socketio.on('text_detection')
def handle_text_detection(results):
    pass
#sentence similarity
@socketio.on('microphone_transcription')
def handle_sentence_similarity(data):
    if "SENTENCE_SIMILARITY" in connected_clients:
        thread_ss = ClientThread(socketio=socketio, client=connected_clients["SENTENCE_SIMILARITY"], tag="transciption", data=data)
        thread_ss.start()

@socketio.on('sentence_similarity_result')
def handle_sentence_similarity_result(results):
    if "WEB_CLIENT":
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="sentence_similarity_result", data=results)
        thread_web_client.start()
    


# mode examen (évaluation d'une eventuelle tricherie)
connected_users = {}
log_objects = {}
@socketio.on('cheat_eval')
def handle_cheat(data):
    source = data['source']
    cheat_result = []

    #init log file
    if data['user_id'] not in log_objects:
        log_directory = "logs/users/"+str(data['user_id'])
        log_filename = f"log_{data['prenom']}_{data['nom']}_{datetime.now().strftime('%Y-%m-%d')}.log"
        log = setup_logger(log_directory=log_directory, log_filename=log_filename)
        current_log = log

    current_log = current_log
        

    if source == 'face_recognition':
        results = data['results']
        print(results)
        if (results['recognition'] == False):
            cheat_result.append({'cheating': True, 'source': source, 'message': "Nous ne reconnaissons pas le visage détecté !!!"})
            current_log.error(f"Statut: Triche détectée - source: {source} - message: Nous ne reconnaissons pas le visage détecté !!!")
        else:
            cheat_result.append({'cheating': False, 'source': source, 'message': "Aucune triche n'a été détecté pour cette question"})
            current_log.info(f"Statut: Normale - source: {source} - message: Aucune triche n'a été détecté")


    elif source == 'phone_camera':
        results = data['results']
        cheating_object = ['cell phone', 'book',  'backpack',  'handbag']
        if len(results) > 0:
            for obj in results:
                if obj['label_name'] in cheating_object and obj['label_score'] >= 0.70:
                    cheat_result.append({'cheating': True, 'source': source, 'message': obj['label_name'] + " détecté !!!", 'score': round(obj['label_score'],2) })
                    current_log.error(f"Statut: Triche détectée - source: {source} - message: {obj['label_name']} détecté - score: {round(obj['label_score'],2)} ")

                elif obj['label_name'] in cheating_object:
                    cheat_result.append({'cheating': False, 'source': source, 'message':"Aucune triche n'a été détecté pour cette question", 'score': round(obj['label_score'],2), 'object_name': obj['label_name']})
                    current_log.info(f"Statut: Normale - source: {source} - message: Aucune triche n'a été détecté")

    
    elif source == 'speech_recognition':
        results = data['results']
        if results['score_transciption_answer'] > 0.7:
            cheat_result.append({'cheating': True, 'source': source, 'message': "Nous avons détecté  un son liée à l'examen", 'score': round(results['score_transciption_answer'],2), 'transcript': results['transcript'], 'answer': results['answer']})
            current_log.error(f"Statut: Triche détectée - source: {source} - message:Nous avons détecté  un son liée à l'examen - score: {round(results['score_transciption_answer'],2)} - transcription : {results['transcript']} - réponse attendue: {results['answer']}")

        else:
            cheat_result.append({'cheating': False, 'source': source, 'message': "Aucune triche n'a été détecté pour cette question", 'score': round(results['score_transciption_answer'],2), 'transcript': results['transcript'], 'answer': results['answer']})
            current_log.info(f"Statut: Normale - source: {source} - message: Aucune triche n'a été détecté - score: {round(results['score_transciption_answer'],2)} - transcription : {results['transcript']} - réponse attendue: {results['answer']}")
            
            


    
    #send cheating result
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="cheat_result", data=cheat_result)
        thread_web_client.start()
        thread_web_client.join()


#download log file: 
@app.route('/download_log_file', methods=['GET'])
def download_file():
    user_id = request.args.get('user_id')
    prenom = request.args.get('prenom')
    nom = request.args.get('nom')
    if not user_id:
        return jsonify({"error": "Filename parameter is missing"}), 400

    file_path = os.path.join("logs/users/"+str(user_id), f"log_{prenom}_{nom}_{datetime.now().strftime('%Y-%m-%d')}.log")
    
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({"error": "File not found"}), 404 


#web server endpoints
@app.route('/signup', methods=['POST'])
def signup():
    db_session = create_session()
    
    nom = request.form['nom']
    prenom = request.form['prenom']
    id = request.form['id']
    password = request.form['password']
    roleUser = request.form['roleUser']
    file = request.files['idPhoto'] if request.files.keys().__contains__('idPhoto') else None 

    if not (nom and prenom and id and password and roleUser):
        return jsonify({'message': f'Veuillez Renseignez tous les champs:'}), 400
    
    # Check if user already exists
    existing_user = db_session.query(Etudiant).filter_by(id=id).first() or db_session.query(Surveillant).filter_by(id=id).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400


    # Create new user
    if(roleUser=='etudiant'):
        if not(file):
            return jsonify({'message': f'Si vous etes etudiant, veuillez renseigner une photo'}), 400
        file_ext = os.path.splitext(file.filename)[1]
        new_filename = f"{id}{file_ext}"
        file_path = f"{ID_IMG_FOLDER}/{new_filename}"
        file.save(file_path)
        new_etudiant = Etudiant(id=id,password=password, nom=nom, prenom=prenom, chemin_photo=file_path)
        db_session.add(new_etudiant)

        #send image to face recognition microservice
        img = cv2.imread(file_path)
        _, buffer = cv2.imencode('.jpg', img)
        image_bytes = buffer.tobytes()
        if "FACE_RECOGNITION" in connected_clients:
            thread_face_recognition = ClientThread(socketio=socketio, client=face_client, tag="new_user_avatar", data={'new_user': str(id), 'image_bytes': image_bytes})
            thread_face_recognition.start()
        

    else:
        new_surveillant = Surveillant(id=id,password=password)
        db_session.add(new_surveillant)
    
    db_session.commit()
    return jsonify({'message': 'User created'}), 200


@app.route('/signin', methods=['POST'])
def login():
    db_session = create_session()
    data = request.json
    if data is None:
        return jsonify({'error': 'Request invalid'}), 400

    id = data.get('id')
    password = data.get('password')

    if id is None or password is None:
        return jsonify({'error': 'id and password are required'}), 400

    # Query the database to find the user
    user = db_session.query(Etudiant).filter_by(id=id).first()
    user2 = db_session.query(Surveillant).filter_by(id=id).first()
    role = 'etudiant' if (user is not None and user.password == password) else 'professeur'
    if (user is None or user.password != password) and (user2 is None or user2.password != password) :
        return jsonify({'error': 'Invalid username or password'}), 401
    else:
        access_token = create_access_token(identity=id)
        if(role=='etudiant'):
            etudiant_details = {'token': access_token,'role' : role,'id':user.id,'nom':user.nom,'prenom':user.prenom}
            # send user details to microservice face recognition
            if "FACE_RECOGNITION" in connected_clients:
                thread_face_recognition = ClientThread(socketio=socketio, client=face_client, tag="new_user_logged", data=etudiant_details)
                thread_face_recognition.start()

            return jsonify(etudiant_details), 200
        else:
            return jsonify({'token': access_token,'role' : role,'id':user2.id,'nom':user2.nom,'prenom':user.prenom}), 200


    # User authenticated successfully, create a session
   

@app.route("/logout", methods=["POST"])
def logout():
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)
    return resp, 200

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)