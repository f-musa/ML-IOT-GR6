from flask import Flask,render_template, request
from flask_socketio import SocketIO
from engineio.payload import Payload
import cv2
import numpy as np
from io import BytesIO
import cvlib as cv
from cvlib.object_detection import draw_bbox
from object_detection import detect



app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
Payload.max_decode_packets = 100
socketio = SocketIO(app, cors_allowed_origins='*')


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
def handleImage(frames_bytes):
	nparr = np.frombuffer(frames_bytes, np.uint8)
	image = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 
	cv2.imwrite("image.jpg", image)	
      

@socketio.on('transfer_audio')
def handle_audio(audio_bytes):
    print(type(audio_bytes))
    

@socketio.on('object_detection')
def handle_object_detection(predictions):
      print(predictions)
      

if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=5000)