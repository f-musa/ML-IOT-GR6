import speech_recognition as sr

# Initialize recognizer class (for recognizing the speech)
r = sr.Recognizer()

# Using the microphone
with sr.Microphone(device_index=2) as source:
    print("Calibrating microphone... Please wait.")
    # Adjust for ambient noise and calibrate the microphone
    r.adjust_for_ambient_noise(source, duration=5)
    print("Microphone calibrated. Please start speaking.")

    try:
        # Capture the audio for a fixed duration of 10 seconds
        print("Recording for 10 seconds...")
        audio = r.record(source, duration=20)  # Record for 10 seconds
        
        # Recognize speech using Google Web Speech API
        text = r.recognize_google(audio)
        print("You said: {}".format(text))

    except sr.UnknownValueError:
        # Error: recognizer does not understand the audio
        print("Google Web Speech could not understand audio")

    except sr.RequestError as e:
        # Error: could not request results from Google Web Speech service
        print("Could not request results from Google Web Speech service; {0}".format(e))
