import React, { useEffect, useState } from 'react'
import defaultImage from '../assets/images/camera_unavailable.png';
import { Typography } from '@mui/material';


const PhoneCamera = (props) => {
  const [predictions, setPredictions] = useState(null);
  const playing = props.playing;
  const socket = props.socket;

  useEffect(()=>{

    let videoPlayer = document.getElementsByClassName('app__phone_camera_test')[0];

    const handleObjectDetectionStream = (data) => {
        
        // Mettre à jour le contenu de la vidéo avec les nouvelles données
        const blob = new Blob([data], { type: 'image/jpeg' });
        const imageURL = URL.createObjectURL(blob);
        videoPlayer.src = imageURL;
  
    };

    const handleObjectPrediction = (data) =>{
        const results = JSON.parse(data);
        setPredictions(results);
        console.log(results);
        
    }

    const handleMobileDisconnected = (data) =>{
      videoPlayer.src = defaultImage;
    }

    if (playing === true){
      socket.emit('open_phone_camera', 'Open phone camera');
      socket.on("phone_camera", handleObjectDetectionStream);
      socket.on("object_label", handleObjectPrediction);
      

      socket.on("mobile_disconnected", handleMobileDisconnected);
      
    }
  }, [playing, socket])
  

  return (
    <div>
        <img  className='app__phone_camera_test' src={defaultImage} style={{width: '100%'}} alt='phone camera' />
        {predictions  && (
           <>
             <Typography>Objets detectés: </Typography>      
             {
                predictions && predictions.map((object, index) => (
                
                    <Typography fontSize={13} key={index}>{`${object.label_name} ( ${object.confidence} ) - distance : ${object.distance} `}</Typography>
                ))
             }
           </>

        )}
    </div>
  )
}

export default PhoneCamera