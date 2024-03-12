class ClientSocket:
    def __init__(self, sid, name):
        self.sid = sid
        self.name = name

    def get_sid(self):
        return self.sid
    
    def get_name(self):
        return self.name
    
    def set_sid(self, sid):
        self.sid = sid

    def set_name(self, name):
        self.name = name
    
    def get_info(self):
        return {'sid':  self.sid, 'name': self.name}