from flask import Flask, render_template, Response, request, redirect, url_for
import face_recognition
import os, sys
import cv2
import numpy as np
import math
import datetime  # Pour générer un nom de fichier unique
from werkzeug.utils import secure_filename


app = Flask(__name__)









UPLOAD_FOLDER = 'faces'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'photo' not in request.files:
            return redirect(request.url)
        file = request.files['photo']
        name = request.form['name']
        family_name = request.form['family_name']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{name}_{family_name}.{file.filename.rsplit('.', 1)[1].lower()}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            return redirect(url_for('streaming'))  # Redirect to the streaming route
    return render_template('index.html')

@app.route('/streaming')
def streaming():
    # Render the streaming page that includes the video feed.
    return render_template('streaming.html')


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
        # self.unknown_faces_detected = {}  # Dictionary to track detection times of unknown faces
        # self.unknown_face_save_interval = 5  # Interval in seconds to save the image of an unknown face
        self.process_current_frame = True
        self.encode_faces()

    def encode_faces(self):
        for image in os.listdir('faces'):
            face_image = face_recognition.load_image_file(f'faces/{image}')
            face_encoding = face_recognition.face_encodings(face_image)[0]

            self.known_face_encodings.append(face_encoding)
            self.known_face_names.append(image)

        print(self.known_face_names)

    def run_recognition(self):
        self.encode_faces()

        video_capture = cv2.VideoCapture(0)

        if not video_capture.isOpened():
            sys.exit('Video source not found...')

        while True:
            ret, frame = video_capture.read()

            if self.process_current_frame:
                small_frame = cv2.resize(frame, (0,0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                self.face_locations = face_recognition.face_locations(rgb_small_frame)
                self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)

                self.face_names = []
                for face_encoding in self.face_encodings:
                    matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                    name = 'Unknown'
                    confidence = 'Unknown'

                    face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)

                    if matches[best_match_index]:
                        name = self.known_face_names[best_match_index]
                        confidence = face_confidence(face_distances[best_match_index])
                    else:
                        # Si un visage "Unknown" est détecté, sauvegarder l'image
                        save_unknown_face_image(frame)
                        print("Cheating detected!")

                    self.face_names.append(f'{name}({confidence})')

            self.process_current_frame = not self.process_current_frame
            for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                cv2.rectangle(frame,(left,top), (right,bottom), (0,0,255), 2)
                cv2.rectangle(frame,(left,bottom - 35), (right,bottom), (0,0,255), -1)
                cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255,255,255), 1)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


        #     if cv2.waitKey(1) == ord('q'):
        #         break
        #
        # video_capture.release()
        # cv2.destroyAllWindows()




face_recognition_instance = FaceRecognition()



@app.route('/video')
def video():
    return Response(face_recognition_instance.run_recognition(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)