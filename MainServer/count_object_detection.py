import threading
import time
import numpy as np
from client_thread import ClientThread


class CountObjectDetection(threading.Thread):
    def __init__(self,data, socketio, client):
        threading.Thread.__init__(self)
        self.socketio = socketio
        self.client = client
        self.stopped = False
        self.data = data

    def run(self):
        # Traiter les données pendant 30 secondes
        results = self.process_data(self.data)
        if "WEB_CLIENT" in self.client:
            client_thread = ClientThread(self.socketio, self.client['WEB_CLIENT'], 'analyze_environnment_result', results)
            client_thread.start()

    def process_data(self, data):
        # liste d'objets suspets qui doivent pas etre présents 
        objets_suspects = ['cell phone', 'book',  'backpack',  'handbag', 'laptop']
        labels_occurrences = {}

        for item in data:
            label_name = item.get('label_name')
            confidence = item.get('confidence', 0)
            label_score = item.get('label_score', 0)


            # Vérifier les conditions pour inclure le label_name
            if label_score >= 0.7 and label_name in objets_suspects:
                if label_name not in labels_occurrences:
                    labels_occurrences[label_name] = []
                labels_occurrences[label_name].append(label_score)

        result_occurences = []
        for label_name, list_score in labels_occurrences.items():
            if len(list_score) > 10:
                result_occurences.append({
                    'label_name' : label_name,
                    'frequence' : len(list_score),
                    'mean_score': np.array(list_score).mean() 
                })

            # if label_name  in labels_occurrences:
            #     labels_occurrences[label_name] += 1
            # else:
            #     labels_occurrences[label_name] = 1

        return result_occurences

    def stop(self):
        self.stopped = True
