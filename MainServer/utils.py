import threading
import json
import logging
import os
from datetime import datetime

class SendDataToClient(threading.Thread):
    def __init__(self, socketio, tag, data):
        threading.Thread.__init__(self)
        self.socketio = socketio
        self.tag = tag
        self.data = data
    
    def run(self):
        self.socketio.emit(self.tag, self.data)


def filter_objet_by_score(items_str, threshold=0.70):
    items = json.loads(items_str)
    return [item for item in items if float(item['label_score']) >= threshold]


def setup_logger(log_directory, log_filename):
    # Crée le dossier s'il n'existe pas
    if not os.path.exists(log_directory):
        os.makedirs(log_directory)
    
    # Chemin complet du fichier de log
    log_filepath = os.path.join(log_directory, log_filename)
    
    # Configuration du logger
    logging.basicConfig(
        level=logging.DEBUG,  # Niveau de log
        format='%(asctime)s - %(levelname)s - %(message)s',  # Format des messages de log
        handlers=[
            logging.FileHandler(log_filepath),  # Fichier de log
            logging.StreamHandler()  # Affiche les logs sur la console
        ]
    )

    return logging
    
        