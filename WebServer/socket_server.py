from flask import Flask, request
from flask_socketio import SocketIO
from engineio.payload import Payload
import cv2
import numpy as np
from flask_sqlalchemy import SQLAlchemy
import os
from text_extraction import TextExtraction,TextExtractionOCR
import io
from pydub import AudioSegment
import time
import easyocr 
import threading
from utils import SendDataToClient

UPLOAD_FOLDER = 'uploads'
mobile_sid = None
is_mobile_connected = False

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
	try:
		np_arr = np.frombuffer(byte_data, np.uint8) 
		image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
		return image
	except Exception:
		print('error to convert bytes to image')


################# TEXT EXTRACTION #########################

thread_for_text_extraction = None
thread_TE_is_running = False


def text_extraction():
	global latest_frames_bytes
	while is_mobile_connected:
		if (latest_frames_bytes != None):
			image = bytes_to_image(latest_frames_bytes)
			reader = easyocr.Reader(['en', 'fr'])
			results = reader.readtext(image)
			text = ''
			for result in results:
				if result[2] > 0.50:
					text += result[1]
					text += ' '
			print(text)
			time.sleep(5)


#to start thread for text extraction
def start_thread_for_text_extraction():
	global thread_for_text_extraction, thread_TE_is_running
	if not thread_TE_is_running:
		thread_for_text_extraction = threading.Thread(target=text_extraction)
		thread_for_text_extraction.daemon = True
		thread_for_text_extraction.start()
		thread_TE_is_running = True
		print("Text extraction started")

# to stop thread for text extraction when mobile is disconnected
def stop_thread_for_text_extraction(sid):
	global is_mobile_connected,mobile_sid, thread_TE_is_running, thread_for_text_extraction
	if (mobile_sid == sid):
		is_mobile_connected = False
		if thread_for_text_extraction != None:
			thread_for_text_extraction.join()
			thread_TE_is_running = False
			print("Mobile disconnected ...")

################ END TEXT EXTRACTION ##########################




@socketio.on('connect')
def handle_connect():
	print(f"Client connected: {request.sid}")
	socketio.emit('from_server', 
				  {'code': 'connection_successful', 'message': 'Connected to the server'}, 
				  room=request.sid)
    
@socketio.on('disconnect')
def handle_disconnect():
	stop_thread_for_text_extraction(request.sid)
	print(f"Client disconnected: {request.sid}")
	
    

@socketio.on('transfer')
def handleImage(frames_bytes):
	global latest_frames_bytes, mobile_sid, is_mobile_connected
	mobile_sid = request.sid
	is_mobile_connected = True

	#send frames to web client
	send_data_navigator = SendDataToClient(socketio=socketio, tag="object_detection_stream", data=frames_bytes)
	send_data_navigator.start()
	send_data_navigator.join()

	# text extraction
	latest_frames_bytes = frames_bytes # frame for text extraction
	start_thread_for_text_extraction()



@socketio.on('object_detection')
def handle_object_detection(predictions):
	socketio.emit("object_label", predictions)


@socketio.on('transfer_audio')
def handle_audio(audio_bytes):
	audio_data = io.BytesIO(audio_bytes)
	audio_segment = AudioSegment.from_file(audio_data)
	filename = "static/audio/user/audio_" + str(time.time()) + ".wav"
	audio_segment.export(filename, format='wav')
	#print(type(audio_bytes))	

@socketio.on('webcam_stream')
def handleWebCam(video_bytes):

	#todo: face recognization
	socketio.emit("face_recognization_stream", video_bytes);


# Start a new thread for sending bytes tagged with 'send_frame'
# thread_send_frame = threading.Thread(target=text_extraction)
# thread_send_frame.daemon = True
# thread_send_frame.start()




      
	


if __name__ == '__main__':
	socketio.run(app, host='0.0.0.0', port=5000,debug=True)