import socketio
from sentence_transformers import SentenceTransformer,util
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')


sio = socketio.Client()
model = SentenceTransformer('all-MiniLM-L6-v2')

@sio.event
def connect():
    print('Connected to the server')
    sio.emit('whoiam', 'TEXT_SIMILARITY')

@sio.event
def disconnect():
    print('Disconnected from server')


#  @sio.on('microphone_transcription')
def handle_sentences_sim_from_transcription(data):
   transcription = data["transcription"]
   answer = data["answer"]

   #compare transcription with answer
   transcription_emb = model.encode(transcription)
   answer_emb = model.encode(answer)
   cos_sim_answer_transcription = util.cos_sim(answer_emb, transcription_emb)

   # read context embedding
   data_list = []
   with open("context_embedding.json", "r") as json_file:
        data_list = json.load(json_file)
   
   #compare transcription with context embedding 
   cosine_context_array = []
   for sentence_emb in data_list:
       for sentence,embedding in sentence_emb.items():
           cos_sim = util.cos_sim(embedding, transcription_emb)
           cosine_context_array.append(cos_sim.numpy()[0][0])
   
   result = {
       'answer_transcription' : cos_sim_answer_transcription.numpy()[0][0],
       'context_transcription' : max(cosine_context_array)
   }

   print(result)

#    sio.emit('sentence_similarity_result', result)

   #context_emb = model.encode(cours_machine_learning)
#    json_data = []
#    for sentence, embedding in zip(cours_machine_learning, context_emb):
#         json_data.append({sentence: embedding.tolist()})

#    with open("context_embedding.json", "w") as json_file:
#         json.dump(json_data, json_file, indent=4)


data = {
    'transcription' : "Régression",
    'answer' : 'Régression logistique',
}

if __name__ == '__main__':
    handle_sentences_sim_from_transcription(data)
    #  sio.connect('http://localhost:5000')
    #  sio.wait()
