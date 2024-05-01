import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { Alert, Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import cameraLoading from '../assets/images/camera_loading.png';
import controlIdentityImg from '../assets/images/control_identity.png';
import {frameToBlob } from '../Utils';



const IdentityControl = (props) => {
    const [startFaceRecognition, setStartFaceRecognition] = useState(false);
	const [socketData, setSocketData] = useState(null);

    const [faceResult, setFaceResult] = useState(null);


    let navigate = useNavigate();

    let user_id = localStorage.getItem('id')
    let prenom = localStorage.getItem('prenom')
    let nom = localStorage.getItem('nom')
    let socket = props.socket;
    let mediaStream = null;
    let requestAnim1 = null;
    let requestAnim2 = null;


    const handleNextPage = ()=>{
        
        handleStopCamera();
        while(requestAnim1--){
            cancelAnimationFrame(requestAnim1);
        }
        while(requestAnim2--){
            cancelAnimationFrame(requestAnim2);
        }
        navigate('/environment-control');
    }

    useEffect(() => {
        let videoElement = null;

        const handleObjectDetectionStream = (data) => {
            setSocketData(data);
            const blob = new Blob([data], { type: 'image/jpeg' });
            const imageURL = URL.createObjectURL(blob);
            videoElement.src = imageURL;
        };

        const handleFaceResults = (data) =>{
            const results = JSON.parse(data);
            console.log(results);
            setFaceResult(results);
        }

        const startVideoCapture = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement = document.getElementsByClassName('app__webcam_stream')[0];

                const updateFrame = async () => {
                    const imageCapture = new ImageCapture(mediaStream.getVideoTracks()[0]);
                    const frame = await imageCapture.grabFrame();
                    const blob = await frameToBlob(frame);
                    const byteArray = await blob.arrayBuffer();

                    if (startFaceRecognition) {
                        socket.emit("webcam_stream", {'user_id': user_id, 'prenom': prenom, 'nom': nom, 'bytes_frames': byteArray})
                        socket.on('face_recognization', handleObjectDetectionStream);

                    }

                    // const imageURL = URL.createObjectURL(blob);
                    // videoElement.src = imageURL;

                    requestAnim1 = requestAnimationFrame(updateFrame);
                };

                requestAnim2 = requestAnimationFrame(updateFrame);
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        };

        if (startFaceRecognition) {
            startVideoCapture();
            socket.on('face_result', handleFaceResults)

        }


        
    }, [startFaceRecognition]);

    const handleStopCamera = () => {
        setStartFaceRecognition(false); // Set state to stop the face recognition
    
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
                if (track.readyState === 'live') {
                    try {
                        track.stop();
                    } catch (error) {
                        console.error('Error stopping track:', error);
                    }
                }
            });
        }
    };
  return (
    <div>
    <Navbar socket={socket} />
    <Container>
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
            >
            <Grid item xs={3}>
            <Typography variant='h5'>Contrôle d'identité du candidat</Typography>
        
            <Card>
                <CardContent>
                        <>
                        <Typography fontSize={14} marginBottom={2}>Veuillez regarder votre caméra. Nous allons effectuer la reconnaissance faciale</Typography>

                        {faceResult?.recognition === true && (
                            <Alert variant="filled" severity="success" style={{marginBottom: '10px'}}>Contrôle d'identité reussi</Alert>
                        )}
                        {faceResult?.recognition === false && (
                            <Alert variant="filled" severity="red" style={{marginBottom: '10px'}}>Nous ne reconnaissons pas votre visage !</Alert>
                        )}
                            
                            {!startFaceRecognition ? (
                                <>
                                <Box display='flex' flexDirection='column'  style={{margin: '10px'}} alignItems='center'>
                                    <img
                                        alt='camera'
                                        src={controlIdentityImg}
                                        style={{width: '180px', marginBottom: '10px'}}
                                    />
                                    <Button  variant="contained" onClick={()=>setStartFaceRecognition(true)}>Démarrer le contrôle</Button>
                                </Box>
                               
                            </>
                            ):(

                                <Box display='flex' flexDirection='column'  style={{margin: '10px'}} alignItems='center'>
                                <img
                                        alt='camera'
                                        src={cameraLoading}
                                        className="app__webcam_stream"
                                        style={{width: '100%', marginBottom: '10px'}}
                                    />
                                
                                </Box>

                            )}

                            {faceResult?.recognition === true && (
                               <>
                                    <Typography fontSize={13}><b style={{color: 'green'}}>Status (SUCCESS)</b>:  Visage trouvé: <b>{faceResult.name}</b></Typography>
                                    <Box m={1} display="flex" justifyContent="flex-end" alignItems="flex-end">
                                        <Button variant="contained" color="success" sx={{ height: 40 }}
                                            onClick={handleNextPage}
                                        >
                                            Suivant
                                        </Button>
                                    </Box>
                               </>
                            )}

                            {faceResult?.recognition === false && (
                                <Typography fontSize={13}><b style={{color: 'red'}}>Status (ERROR)</b>:  <b>{faceResult.name}</b></Typography>

                            )}
                            

                        </>
                    
                </CardContent>
            </Card>
            </Grid>
        </Grid>
    </Container>
</div>
  )
}

export default IdentityControl