from flask import Flask,request
from flask_socketio import SocketIO
from client import ClientSocket
from flask_sqlalchemy import SQLAlchemy
from engineio.payload import Payload
from client_thread import ClientThread
import json
import os

UPLOAD_FOLDER = 'uploads'


app = Flask(__name__)
app.config['SECRET_KEY'] = 'this_is_a_production_server'
Payload.max_decode_packets = 100
socketio = SocketIO(app, cors_allowed_origins='*')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db' 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy()
db.init_app(app)

if not os.path.exists('database.db'):
	with app.app_context():
		from models.schema import create_all_metadata
		create_all_metadata()
		print('Created Database!')

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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)