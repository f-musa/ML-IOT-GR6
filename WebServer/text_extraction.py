import cv2 
import easyocr 

import threading
import pytesseract

class TextExtraction(threading.Thread):
    def __init__(self, img):
        threading.Thread.__init__(self)
        self.img = img

    def run(self):
        reader = easyocr.Reader(['en', 'fr'])
        myText = reader.readtext(self.img)
        print(myText)
        return myText
    
class TextExtractionOCR(threading.Thread):
    def __init__(self, img):
        threading.Thread.__init__(self)
        pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe'
        self.img = img

    def run(self):
        text = pytesseract.image_to_string(self.img)
        print(text)
        return text

