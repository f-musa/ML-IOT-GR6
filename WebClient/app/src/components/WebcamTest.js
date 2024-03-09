import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'

const WebcamTest = (props) => {

  const isCameraAccessed = props.isCameraAccessed;
  const setIsCameraAccessed = props.setIsCameraAccessed;

  // const [isCameraAccessed, setIsCameraAccessed] = useState(null);
  const playing = props.playing;

  useEffect(()=>{
    let videoPlayer = document.getElementsByClassName('app__webcam_test')[0];


    if (playing === true){
      navigator.getUserMedia(
        {
          video: true,
        },
        async (stream) => {
          videoPlayer.srcObject = stream;
          setIsCameraAccessed(true);
  
        },
        (error) => {
          console.error('Error accessing webcam:', error);
          setIsCameraAccessed(false);
        })
    }
  }, [playing])
  

  return (
    <div>
        <video autoPlay muted className='app__webcam_test' style={{width: '317px'}}></video>
        {isCameraAccessed === true && (<Typography color='green' fontSize={14} fontWeight='bold'>Status: disponible</Typography>)} 
        {isCameraAccessed === false && (<Typography style={{color: 'red'}}>Status: indisponible</Typography>)} 
    </div>
  )
}

export default WebcamTest