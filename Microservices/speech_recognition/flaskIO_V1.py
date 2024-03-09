from flask import Flask, render_template
from flask_socketio import SocketIO
import speech_recognition as sr

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('start_recognition')
def handle_recognition(bytes):
    # Initialize the recognizer
    r = sr.Recognizer()

    # Your speech recognition code here
    with sr.Microphone() as source:
        audio = r.listen(source)
    
    try:
        # Transcribe audio to text
        text = r.recognize_google(audio, language='fr-FR') # Specify the language
        # Emit the transcribed text back to the client
        socketio.emit('transcription', text)
    except sr.UnknownValueError:
        socketio.emit('error', "Couldn't understand the audio")
    except sr.RequestError as e:
        socketio.emit('error', f"Service error: {e}")
