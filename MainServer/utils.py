import threading


class SendDataToClient(threading.Thread):
    def __init__(self, socketio, tag, data):
        threading.Thread.__init__(self)
        self.socketio = socketio
        self.tag = tag
        self.data = data
    
    def run(self):
        self.socketio.emit(self.tag, self.data)
    
        