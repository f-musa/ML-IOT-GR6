from flask import Flask, request
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os
from pydub import AudioSegment
from io import BytesIO
from openai import OpenAI


load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
app = Flask(__name__)
socketio = SocketIO(app)

def triche_detector(transcript,contexte) : 
    response = client.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt=f"You're a teacher, We are in an exam and this is the text spoken by the student {transcript} , and here is the context {contexte}, answer me with a percentage if there is fraud done by the student or not"
    )

    return response



def transcrire_et_analyser(audio_bytes, contexte):
    # Convertir les bytes en audio
    audio_segment = AudioSegment.from_file(BytesIO(audio_bytes), format="mp3")
    
    # Vous devrez enregistrer temporairement le fichier pour l'utiliser avec l'API OpenAI
    fichier_temp = "temp_audio.wav"
    audio_segment.export(fichier_temp, format="wav")
    
    with open(fichier_temp, 'rb') as audio_file:
        transcript_response = client.Audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text"
        )
    #transcript = transcript_response['data']['text']
    resultat=triche_detector(transcript_response,contexte)
    # Supprimer le fichier temporaire
    os.remove(fichier_temp)
    
    return resultat


@socketio.on('audio_stream')
def handle_audio_stream(data):
    audio_bytes = data['audio']  # Assurez-vous que c'est bien des bytes
    contexte = data['contexte']
    resultat = transcrire_et_analyser(audio_bytes, contexte)
    emit('resultat', {'resultat': resultat})

if __name__ == '__main__':
    socketio.run(app, debug=True)