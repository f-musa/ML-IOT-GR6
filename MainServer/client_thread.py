import threading
class ClientThread(threading.Thread):
    def __init__(self, socketio, client, tag, data):
        threading.Thread.__init__(self)
        self.socketio = socketio
        self.client = client
        self.tag = tag
        self.data = data

    def run(self):
        self.socketio.emit(self.tag, self.data, room=self.client.get_sid())
        