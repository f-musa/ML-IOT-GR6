from flask import Flask, jsonify,request, session
from flask_socketio import SocketIO
from client import ClientSocket
from flask_sqlalchemy import SQLAlchemy
from engineio.payload import Payload
from client_thread import ClientThread
from flask_cors import CORS
from models.schema import *
from sqlalchemy.orm import sessionmaker
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
import json
import os

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
         tag = key.lower() + "_disconnected"
         data = key.lower() + "is disconnected"
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
    if name == "FACE_RECOGNIZATION":
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
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="object_label", data=predictions)
        thread_web_client.start()
        thread_web_client.join()

@socketio.on('object_detection_text_extraction')



# webcam pc
@socketio.on('webcam_stream')
def handle_webcam(frames_bytes):
    if "FACE_RECOGNIZATION" in connected_clients:
        thread_face_recognization = ClientThread(socketio=socketio, client=face_client, tag="webcam", data=frames_bytes)
        thread_face_recognization.start()


@socketio.on('face_recognization')
def handle_face_recognization(frames_bytes):
    if "WEB_CLIENT" in connected_clients:
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="face_recognization", data=frames_bytes)
        thread_web_client.start()

@socketio.on('face_result')
def handle_face_result(results):
    json_result = json.dumps(results)
    if "WEB_CLIENT":
        thread_web_client = ClientThread(socketio=socketio, client=connected_clients["WEB_CLIENT"], tag="face_result", data=json_result)
        thread_web_client.start()




# text detection
@socketio.on('text_detection')
def handle_text_detection(results):
    print(results)


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
        # If any required field is missing, return an error response
        return jsonify({'message': f'Veuillez Renseignez tous les champs:'}), 400
    
    # Check if user already exists
    existing_user = db_session.query(Etudiant).filter_by(id=id).first() or db_session.query(Surveillant).filter_by(id=id).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400


    # Create new user
    if(roleUser=='etudiant'):
        if not(file):
            return jsonify({'message': f'Si vous etes etudiant, veuillez renseigner une photo'}), 400
        # Save file to a specific directory, you can adjust the path as needed
        file_ext = os.path.splitext(file.filename)[1]
        new_filename = f"{id}{file_ext}"
        file_path = f"{ID_IMG_FOLDER}/{new_filename}"
        file.save(file_path)
        new_etudiant = Etudiant(id=id,password=password, nom=nom, prenom=prenom, chemin_photo=file_path)
        db_session.add(new_etudiant)
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
        print(access_token)
        if(role=='etudiant'):
            return jsonify({'token': access_token,'role' : role,'id':user.id,'nom':user.nom,'prenom':user.prenom}), 200
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