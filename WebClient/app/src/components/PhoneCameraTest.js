import React, { useEffect } from 'react'
import defaultImage from '../assets/images/camera_unavailable.png';
import { Typography } from '@mui/material';


const PhoneCameraTest = (props) => {
  const isPhoneCameraAccessed = props.isPhoneCameraAccessed;
  const setIsPhoneCameraAccessed = props.setIsPhoneCameraAccessed;
  // const [isPhoneCameraAccessed, setIsPhoneCameraAccessed] = useState(null);

  const playing = props.playing;
  const socket = props.socket;

  useEffect(()=>{

    let videoPlayer = document.getElementsByClassName('app__phone_camera_test')[0];

    const handleObjectDetectionStream = (data) => {
        
        // Mettre à jour le contenu de la vidéo avec les nouvelles données
        const blob = new Blob([data], { type: 'image/jpeg' });
        const imageURL = URL.createObjectURL(blob);
        videoPlayer.src = imageURL;
        setIsPhoneCameraAccessed(true);
  
    };

    const handleMobileDisconnected = (data) =>{
      setIsPhoneCameraAccessed(false);
      videoPlayer.src = defaultImage;
    }

    if (playing === true){
      socket.emit('open_phone_camera', 'Open phone camera');
      socket.on("phone_camera", handleObjectDetectionStream);

      socket.on("mobile_disconnected", handleMobileDisconnected);
      
    }
  }, [playing, socket, setIsPhoneCameraAccessed, isPhoneCameraAccessed])
  

  return (
    <div>
        <img  className='app__phone_camera_test' src={defaultImage} style={{width: '100%'}} alt='phone camera test' />
        {isPhoneCameraAccessed === true && (<Typography color='green' fontSize={13} fontWeight='bold'>Status: disponible</Typography>)} 
        {isPhoneCameraAccessed === false && (<Typography style={{color: 'red'}} fontSize={13} fontWeight='bold'>Status: indisponible</Typography> )} 
    </div>
  )
}

export default PhoneCameraTest