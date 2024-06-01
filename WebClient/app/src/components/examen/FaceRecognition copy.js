import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { frameToBlob, socket } from '../../Utils';
import { etablish_socket_connection } from '../../ConnectionManager';

const FaceRecognition = (props) => {
  const playing = props.playing;
  const user = props.user;
  const setFaceRecognitionResults = props.setFaceRecognitionResults;
  useEffect(()=>{
    etablish_socket_connection();

    const handleFaceResults = (data) => {
      const results = JSON.parse(data);
      setFaceRecognitionResults(results);
    }
    const handleFaceRecognition = async(stream) => {

      const updateFrame = async() =>{
        const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
        const frame = await imageCapture.grabFrame();
        const blob = await frameToBlob(frame);
        const byteArray = await blob.arrayBuffer();
        socket.emit("webcam_stream", {'user_id': user.id, 'prenom': user.prenom, 'nom': user.nom, 'bytes_frames': byteArray, 'mode': 'examen'})        
        const requestAnim1 = requestAnimationFrame(updateFrame);
      }
      const requestAnim2 = requestAnimationFrame(updateFrame);


    }

     if (playing){
      navigator.getUserMedia(
        {
          video: true,
        },
        async (stream) => {
          handleFaceRecognition(stream);
        },
        (error) => {
          console.error('Error accessing webcam:', error);
        })
      
      socket.on('face_result', handleFaceResults)

      

     }
  }, [playing])
  

}

export default FaceRecognition