import React, { useEffect, useState } from 'react';
import { blobToByteArray, frameToBlob } from '../Utils';
import defaultImage from '../assets/images/camera_unavailable.png';


function WebcamStream(props) {
	const [playing, setPlaying] = useState(false);
	const [socketData, setSocketData] = useState(null);


	const socket = props.socket;

	useEffect(()=>{

		if (playing === true){
			navigator.getUserMedia(
				{
					video: true,
				},
				async (stream) => {

					let imageURL = null;
					let video = document.getElementsByClassName('app__webcam_stream')[0];
	
					const handleObjectDetectionStream = (data) =>{
						setSocketData(data)
						const blob = new Blob([data], { type: 'image/JPEG' });
						imageURL = URL.createObjectURL(blob);
						video.src = imageURL
			
					}
	
					
					if (video) {

						const videoTrack = stream.getVideoTracks()[0];
						const imageCapture = new ImageCapture(videoTrack);
						const frame = await imageCapture.grabFrame();

						const blob = await frameToBlob(frame);
						const byteArray = await blobToByteArray(blob);
						
						setInterval(() => {

							if (playing === true){
								socket.emit('webcam_stream', byteArray);
								socket.on('face_recognization', handleObjectDetectionStream);
								console.log('okk');
							}
						}, 100);
						
					
					}
				},
				(err) => console.error(err)
			);
		}

	console.log('sent');
	}, [playing, socketData, socket])


	const startVideo = () => {
		setPlaying(true);

	};

	const stopVideo = () => {
		setPlaying(false);
	};

	return (
		<div style={{width: '100%'}}>
				<img
					alt='camera'
					src={defaultImage}
					className="app__webcam_stream"
					style={{width: '100%'}}
				/>
				{playing ? (
					<button onClick={stopVideo}>Stop</button>
				) : (
					<button onClick={startVideo}>Start</button>
				)}
		</div>
	);
}

export default WebcamStream;