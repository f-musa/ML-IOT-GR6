import socketio
import cv2
import numpy as np
import pytesseract
import easyocr

sio = socketio.Client()
pytesseract.pytesseract.tesseract_cmd = 'D:\\tesseract\\Tesseract-OCR\\tesseract.exe'

text_extraction_running = False

@sio.event
def connect():
    print('Connected to the server')
    sio.emit('whoiam', 'TEXT_EXTRACTION')

@sio.event
def disconnect():
    print('Disconnected from server')


@sio.on('phone_camera')
def handle_camera_mobile(frames_bytes):
    global text_extraction_running
    if(not text_extraction_running):
        text_extraction_running = True
        np_arr = np.frombuffer(frames_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        reader = easyocr.Reader(['fr', 'en'], gpu=False)
        results = reader.readtext(image)
        text = ''
        for result in results:
            if(result[2] >= 0.6):
                text += result[1]
                text += '   '
        if len(results) > 0:
            sio.emit("text_detection", text)

        text_extraction_running = False
        

    

if __name__ == '__main__':
    sio.connect('http://localhost:5000')
    sio.wait()
