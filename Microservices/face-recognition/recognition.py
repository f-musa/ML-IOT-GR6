from flask import Flask, render_template, Response, request, redirect, url_for
from flask_socketio import SocketIO
import face_recognition
import os, sys
import cv2
import numpy as np
import math
import datetime
import socketio
import threading


app = Flask(__name__)
sio = socketio.Client()

UPLOAD_FOLDER = 'faces'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@sio.event
def connect():
    print('Connected to the server')
    sio.emit('whoiam', 'FACE_RECOGNIZATION')


@sio.event
def disconnect():
    print('Disconnected from Broadcast Service')




def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def face_confidence(face_distance, face_match_threshold=0.6):
    range = (1.0 - face_match_threshold)
    linear_val = (1.0 - face_distance) / (range * 2.0)

    if face_distance > face_match_threshold:
        return str(round(linear_val * 100, 2)) + '%'
    else:
        value = (linear_val + ((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
        return str(round(value, 2)) + '%'
    

def save_unknown_face_image(frame):
    """
    Sauvegarde l'image du cadre actuel lorsque un visage inconnu est détecté.
    """
    save_path = 'unknown_faces'
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = os.path.join(save_path, f'unknown_{timestamp}.jpg')
    cv2.imwrite(filename, frame)
    print(f"Image saved: {filename}")


class FaceRecognition:
    def __init__(self):
        self.face_locations = []
        self.face_encodings = []
        self.face_names = []
        self.known_face_encodings = []
        self.known_face_names = []
        self.process_current_frame = True
        self.encode_faces()

    def encode_faces(self):
        for image in os.listdir('faces'):
            face_image = face_recognition.load_image_file(f'faces/{image}')
            face_encoding = face_recognition.face_encodings(face_image)[0]

            self.known_face_encodings.append(face_encoding)
            self.known_face_names.append(image)

    def run_recognition(self, frame, socket, height, width):
        if self.process_current_frame:
            small_frame = cv2.resize(frame, (0,0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            self.face_locations = face_recognition.face_locations(rgb_small_frame)
            self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)

            self.face_names = []
            confidence = 'Unknown'
            for face_encoding in self.face_encodings:
                matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                name = 'Unknown'
                confidence = 'Unknown'

                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)

                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
                    name = name.split('.')[0]
                    confidence = face_confidence(face_distances[best_match_index])
                    socket.emit('face_result', {'recognition': True, 'name': name, 'confidence': confidence})

                # else:
                #     if not recording:
                #         timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                #         video_filename = os.path.join('unknown_faces', f'unknown_{timestamp}.avi')
                #         video_writer = cv2.VideoWriter(video_filename, fourcc, fps,
                #                                         (frame.shape[1], frame.shape[0]))
                #         recording = True
                #     if recording:
                #         video_writer.write(frame)

                #     # print("Cheating detected! Unknown face saved.")
                #     #save_unknown_face_image(frame)
                #     #print("Cheating detected! Unknown face saved.")
                else:
                    socket.emit('face_result', {'recognition': False, 'name': 'Unknown face'})


                self.face_names.append(f'{name}({confidence})')

            for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                cv2.rectangle(frame,(left,top), (right,bottom), (0,0,255), 2)
                cv2.rectangle(frame,(left,bottom - 35), (right,bottom), (0,0,255), -1)
                cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255,255,255), 1)
                # print(frame.shape,  [top, left, right, bottom])

            dim = (width, height)
            resized_frame = cv2.resize(frame, dim, interpolation = cv2.INTER_AREA)
            ret, buffer = cv2.imencode('.jpg', resized_frame)
            frame_bytes = buffer.tobytes()
            socket.emit('face_recognization', frame_bytes)

    def start_recording(self, frame):
        fps = 20  # Assuming 20 FPS, adjust based on your needs
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        frame_width, frame_height = frame.shape[1], frame.shape[0]
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        video_filename = f"unknown_faces/unknown_{timestamp}.avi"
        self.video_writer = cv2.VideoWriter(video_filename, fourcc, fps, (frame_width, frame_height))
        self.recording = True

    def stop_recording(self):
        if self.video_writer:
            self.video_writer.release()
        self.recording = False
        self.video_writer = None


face_recognition_instance = FaceRecognition()

@sio.on('webcam')
def handle_face_recognization(bytes_frames):
    global face_recognition_instance
    nparr = np.frombuffer(bytes_frames, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    scale_percent = 0.7
    original_width = frame.shape[1]
    original_height = frame.shape[0]
    width = int(original_width * scale_percent)
    height = int(original_height * scale_percent)
    dim = (width, height)
    resized_frame = cv2.resize(frame, dim, interpolation = cv2.INTER_AREA)
    recognition_thread = threading.Thread(target=face_recognition_instance.run_recognition, args=(resized_frame,sio,original_height, original_width))
    recognition_thread.start()



if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    sio.connect('http://127.0.0.1:5000')
    while True:
        sio.sleep(1)
