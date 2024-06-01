import React, { useState } from 'react';
import { blobToByteArray, frameToBlob } from '../Utils';
import styled from 'styled-components';

const Rectangle = styled.div`
    position: absolute;
    top: ${props => props.top}px; /* Dynamic top position */
    left: ${props => props.left}px; /* Dynamic left position */
    width: ${props => props.width}px; /* Dynamic width */
    height: ${props => props.height}px; /* Dynamic height */
    border: 2px solid red; /* Border color and thickness */
    background-color: transparent; /* Transparent background */
	`;

function WebcamStreamBis(props) {
	const [playing, setPlaying] = useState(false);
	const [faceCoordinates, setFaceCoordinates] = useState([]);

	const socket = props.socket;

	

	const startVideo = () => {
		setPlaying(true);
		navigator.getUserMedia(
			{
				video: true,
			},
			(stream) => {
                // const mediaRecorder = new MediaRecorder(stream);
				// 	mediaRecorder.ondataavailable = (event) => {
				// 		if (event.data && event.data.size > 0) {
				// 			const reader = new FileReader();
				// 			reader.onload = () => {
				// 				const arrayBuffer = reader.result;
				// 				const uint8Array = new Uint8Array(arrayBuffer);

				// 				if (props.socket.connected){
				// 					props.socket.emit('webcam_stream', uint8Array);
				// 				}
								
				// 			};
				// 			reader.readAsArrayBuffer(event.data);
				// 		}
				// 	};
				// 	mediaRecorder.start(100);

				let video = document.getElementsByClassName('app__webcam_stream')[0];
				video.srcObject = stream;
				const handleObjectDetectionStream = (data) =>{
					// const blob = new Blob([data], { type: 'image/JPEG' });
					// imageURL = URL.createObjectURL(blob);
					// video.src = imageURL

					setFaceCoordinates(data)
		
				}

				
					setInterval(async()=>{
						if (video) {

	
							const videoTrack = stream.getVideoTracks()[0];
							const imageCapture = new ImageCapture(videoTrack);
							const frame = await imageCapture.grabFrame();
	
							const blob = await frameToBlob(frame);
							const byteArray = await blobToByteArray(blob);
							socket.emit('webcam_stream', byteArray);
							socket.on('face_coordinates', handleObjectDetectionStream);
							
							// video.onload = () => {
							// 	URL.revokeObjectURL(imageURL);
							// };

	
	
				
						}
					}, 100)
			},
			(err) => console.error(err)
		);
	};

	const stopVideo = () => {
		setPlaying(false);
		// video.srcObject.getTracks()[0].stop();
	};

	return (
		<div style={{}}>
				<div className='container' style={{ position: 'relative', display: 'inline-block',width: '100%' }}>
					<video
						autoPlay
						className="app__webcam_stream"
						style={{ maxWidth: '100%', height: 'auto'}}
					/>
					{faceCoordinates.length > 0 && (
						<Rectangle top={0} left={0} width={faceCoordinates[2]} height={faceCoordinates[3]} />
					)}
				</div>
				{playing ? (
					<button onClick={stopVideo}>Stop</button>
				) : (
					<button onClick={startVideo}>Start</button>
				)}
		</div>
	);
}

export default WebcamStreamBis;