from flask import Flask, request
from flask_socketio import SocketIO
from engineio.payload import Payload
import cv2
import numpy as np
from flask_sqlalchemy import SQLAlchemy
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

def bytes_to_image(byte_data):
	np_arr = np.frombuffer(byte_data, np.uint8) 
	print(np_arr)
	image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
	return image

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    socketio.emit('from_server', 
				  {'code': 'connection_successful', 'message': 'Connected to the server'}, 
				  room=request.sid)
    
@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    socketio.emit('from_server', 
				  {'code': 'disconnected', 'message': 'Disconnected to the server'}, 
				  room=request.sid)
    

@socketio.on('transfer')
def handleImage(msg):
	nparr = np.frombuffer(msg, np.uint8)
	image = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 
	cv2.imwrite("image.jpg", image)

@socketio.on('transfer_audio')
def handle_audio(audio_bytes):
	print(audio_bytes)	

@socketio.on('webcam_stream')
def handleWebCam(video_bytes):
	print(bytes_to_image(video_bytes))
	


if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=5000,debug=True)