import React, { useEffect } from 'react'
import { socket } from '../../Utils';

const PhoneCameraStream = (props) => {
    let playing = props.playing;
    let setPhoneCameraResults = props.setPhoneCameraResults;
    const handleObjectDetectionStream = (data) => {
      setPhoneCameraResults(data);
    }
    useEffect(()=>{

        if (playing === true){
            socket.emit('open_phone_camera', 'Open phone camera');
            socket.on("object_label", handleObjectDetectionStream);
        }

    }, [playing])
  return (
    <></>
  )
}

export default PhoneCameraStream