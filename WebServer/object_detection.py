
import cvlib as cv
from cvlib.object_detection import draw_bbox
import cv2
import time

list_objects_labels = ["cell phone", "laptop", "book", "person"]

def detect(frame):
    try:
        cv2.imwrite("test.png", frame)
        bbox, label, conf = cv.detect_common_objects(frame, confidence=0.25, model='yolov4-tiny')
        if len(label) < 10:
            l  = [value for value in label if value in list_objects_labels]
            print(l)
        time.sleep(2000)
    except:
        print("error")

# open webcam
# webcam = cv2.VideoCapture(0)

# if not webcam.isOpened():
#     print("Could not open webcam")
#     exit()
    

# while webcam.isOpened():

#     # read frame from webcam 
#     status, frame = webcam.read()
#     print(frame.shape)

#     bbox, label, conf = cv.detect_common_objects(frame, confidence=0.25, model='yolov4-tiny')

#     print(bbox, label, conf)

#     # draw bounding box over detected objects
#     out = draw_bbox(frame, bbox, label, conf)

#     # display output
#     cv2.imshow("Real-time object detection", out)

#     # press "Q" to stop
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break
    
# # release resources
# webcam.release()
# cv2.destroyAllWindows()        