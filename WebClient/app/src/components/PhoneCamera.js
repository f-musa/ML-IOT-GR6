import React, { useEffect, useState } from 'react'
import defaultImage from '../assets/images/camera_unavailable.png';
import { Box, CircularProgress, Typography } from '@mui/material';


const PhoneCamera = (props) => {
  const [predictions, setPredictions] = useState(null);
  const [concatPredictions, setConcatPredictions] = useState([]);
  const playing = props.playing;
  const socket = props.socket;
  const seconds = props.seconds;
  const setEnvironnmentResult = props.setEnvironnmentResult;
  const setInProcess = props.setInProcess;

  useEffect(()=>{

    let videoPlayer = document.getElementsByClassName('app__phone_camera_test')[0];

    const handleObjectDetectionStream = (data) => {
        
        // Mettre à jour le contenu de la vidéo avec les nouvelles données
        const blob = new Blob([data], { type: 'image/jpeg' });
        const imageURL = URL.createObjectURL(blob);
        videoPlayer.src = imageURL;
  
    };

    const handleObjectPrediction = (data) =>{
        const results = data;
        setPredictions(results);
        setConcatPredictions((prevConcatPredictions) => {
          const updatedPredictions = [...prevConcatPredictions, ...results];
          return updatedPredictions;
        });
        
    }

    const handleMobileDisconnected = (data) =>{
      videoPlayer.src = defaultImage;
    }

    const handleAnalyzeEnvironnmentResult = (results) =>{
      setEnvironnmentResult(results);
      setConcatPredictions([]);
     
      setInProcess(false);
    }

    if (playing === true){
      socket.emit('open_phone_camera', 'Open phone camera');
      socket.on("phone_camera", handleObjectDetectionStream);
      socket.on("object_label", handleObjectPrediction);
      

      socket.on("mobile_disconnected", handleMobileDisconnected);

      socket.on("analyze_environnment_result", handleAnalyzeEnvironnmentResult);
      
    }
  }, [playing, socket])


  // envoyé les prédictions après 30 secondes scan pour une analyse

  useEffect(()=>{

    if(seconds == 0){
      setInProcess(true);
      socket.emit('analyze_environnment', concatPredictions);
    }

  }, [seconds])

  

  return (
    <div>
        <img  className='app__phone_camera_test' src={defaultImage} style={{width: '100%'}} alt='phone camera' />
    </div>
  )
}

export default PhoneCamera