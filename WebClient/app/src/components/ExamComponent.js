import React, { useEffect, useState } from 'react'
import FaceRecognition from './examen/FaceRecognition';
import SpeechRecognitionStream from './examen/SpeechRecognitionStream';
import PhoneCameraStream from './examen/PhoneCameraStream';
import { socket } from '../Utils';


const ExamComponent = (props) => {
    
    const [faceRecognitionResults, setFaceRecognitionResults] = useState();
    const [transcription, setTranscription] = useState();
    const [phoneCameraResults, setPhoneCameraResults] = useState();
    const [ssResults, setSsResults] = useState();
    
    let cheatingResults = props.cheatingResults;
    let setCheatingResults = props.setCheatingResults;

    

    const playing = true;
    const currentQuestion = props.currentQuestion;

    const user = {
        id : localStorage.getItem('id'),
        prenom : localStorage.getItem('prenom'),
        nom : localStorage.getItem('nom')
    }

    const handleCheatingResult = (cheat_result) =>{
         setCheatingResults(cheat_result);
    }

    
    useEffect(()=>{
        if (faceRecognitionResults){
            socket.emit("cheat_eval", {'user_id': user.id, 'prenom': user.prenom, 'nom': user.nom, 'results': faceRecognitionResults, 'mode': 'examen', 'source':'face_recognition'})        
        }


    }, [faceRecognitionResults])

    useEffect(()=>{
        if (transcription){
            socket.emit("cheat_eval", {'user_id': user.id, 'prenom': user.prenom, 'nom': user.nom, 'results': ssResults, 'mode': 'examen', 'source':'speech_recognition'})   
        }
    }, [ssResults])

    useEffect(()=>{
        if(phoneCameraResults){
        socket.emit("cheat_eval", {'user_id': user.id, 'prenom': user.prenom, 'nom': user.nom, 'results': phoneCameraResults, 'mode': 'examen', 'source':'phone_camera'})        

        }        
    }, [phoneCameraResults])

    // cheating result
    useEffect(()=>{
        socket.on('cheat_result', handleCheatingResult);
    },[cheatingResults])

    return (
        <>
            <div>
                <FaceRecognition playing={true }  user={user} setFaceRecognitionResults={setFaceRecognitionResults}/>
                <SpeechRecognitionStream playing={true} setTranscription={setTranscription} sentence_similarity={true} setSsResults={setSsResults} currentQuestion={currentQuestion} />
                <PhoneCameraStream playing={true} setPhoneCameraResults={setPhoneCameraResults} />

            </div>
        </>
  )
}

export default ExamComponent