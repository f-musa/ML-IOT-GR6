# ML-IOT-GR6 
An exam monitoring system using machine learning (ML) and internet of thing (IOT)

# HOW TO RUN THE FULL PROJECT
First, turn on the main server

Second, Run microservices (Face recognition, text_extraction, speech_to_text)

Third, Run WebClient

## How to turn on the main server



### Packages Installation

Install Packages with pip

```bash
    cd MainServer # change directory 

    python -m venv venv # to create virtual environment

    .\venv\Scripts\activate #to activate the environment

    pip install -r requirements.txt # to install all dependencies
  
```
To run the MainServer

```bash
   python main_server.py 
```

After the server will run on port 5000

### Ngrok to create tunnel for the server 
First install ngrok and add it into variables environment,
Add your token  (create an account, we will get your token for free)
```bash
ngrok config add-authtoken <token>
```
after you can start the tunnel on port 5000 on new terminal
```bash
ngrok http 5000
```
we will get link, copy the link and we will use it later
    

## How to run microservices

The method still the same for each microservice. For example with face recognition

### Packages Installation for a microservice

Install Packages with pip

```bash
    cd Microservices/face-recognition  # change directory 

    python -m venv venv # to create virtual environment

    .\venv\Scripts\activate #to activate the environment

    pip install -r requirements.txt # to install all dependencies
  
```
To run the face recognition microservice

```bash
   python recognition.py

```
   

## How to run WebClient


```bash
   cd WebClient/app

```

### Create .env file 
First, create .env file into the app folder and add ngrok url for the server and add the url 


REACT_APP_SERVER_URL=

### Packages Installation for a the web app
After, install the dependencies using npm

```bash
    npm install
```
To run the WebClient 
 ```bash
    npm start
```

