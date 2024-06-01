import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { frameToBlob, socket } from '../../Utils';
import { etablish_socket_connection } from '../../ConnectionManager';

const FaceRecognition = (props) => {
  const playing = props.playing;
  const user = props.user;
  const setFaceRecognitionResults = props.setFaceRecognitionResults;

  useEffect(() => {
    etablish_socket_connection();

    const handleFaceResults = (data) => {
      const results = JSON.parse(data);
      setFaceRecognitionResults(results);
      console.log(results);
    };

    const handleFaceRecognition = async (stream) => {
      const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);

      const updateFrame = async () => {
        const frame = await imageCapture.grabFrame();
        const blob = await frameToBlob(frame);
        const byteArray = await blob.arrayBuffer();
        socket.emit("webcam_stream", {'user_id': user.id, 'prenom': user.prenom, 'nom': user.nom, 'bytes_frames': byteArray, 'mode': 'examen'}) 
      };

      // Envoyer une image par seconde
      const intervalId = setInterval(updateFrame, 200);

      // Nettoyage en cas de fin de streaming
      return () => clearInterval(intervalId);
    };

    if (playing) {
      navigator.mediaDevices.getUserMedia(
        {
          video: true,
        },
      ).then((stream) => {
        const cleanup = handleFaceRecognition(stream);

        // Nettoyage en cas de fin de lecture
        return () => {
          if (cleanup) cleanup();
          stream.getTracks().forEach(track => track.stop());
        };
      }).catch((error) => {
        console.error('Error accessing webcam:', error);
      });

      socket.on('face_result', handleFaceResults);
    }

    // Nettoyage de l'effet
    return () => {
      socket.off('face_result', handleFaceResults);
    };
  }, [playing]);
};

export default FaceRecognition;
