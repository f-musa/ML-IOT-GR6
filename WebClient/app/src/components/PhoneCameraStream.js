import React, { useEffect, useState } from 'react';
import defaultImage from '../assets/images/camera_unavailable.png';


function PhoneCameraStream(props) {

	const socket = props.socket;
	const [socketData, setSocketData] = useState(null);

	useEffect(()=>{


		// Créer le blob et son URL d'objet en dehors de l'intervalle
	let blob = new Blob([], { type: 'image/jpeg' });
	let imageURL = URL.createObjectURL(blob);
	let video = document.getElementsByClassName('app__phone_camera_stream')[0];



	// Utiliser une variable pour indiquer si le flux de la caméra est en cours
	let cameraStreamActive = false;

	// Fonction pour gérer le flux de la caméra
	const handleObjectDetectionStream = (data) => {
		setSocketData(data);

		
		if (cameraStreamActive) {
			// Mettre à jour le contenu de la vidéo avec les nouvelles données
			blob = new Blob([data], { type: 'image/jpeg' });
			imageURL = URL.createObjectURL(blob);
			video.src = imageURL;
		}


	};

	if (!cameraStreamActive) {
		cameraStreamActive = true;
		socket.on("phone_camera", handleObjectDetectionStream);

	}


	if (!cameraStreamActive) {
		// Désactiver le flux de la caméra lorsque le socket est déconnecté
		cameraStreamActive = false;
		video.src = defaultImage;
	}

	// Démarrer l'intervalle
	// const intervalId = setInterval(() => {
		
	// });




	}, [socketData])
    
	return (
		<img  className='app__phone_camera_stream' src={defaultImage} style={{width: '100%'}} />
	);
}

export default PhoneCameraStream;