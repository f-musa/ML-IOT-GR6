import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import {Box, Button, Card, CardContent, Container, Grid,Typography } from '@mui/material'
import WebcamTest from '../components/WebcamTest';
import PhoneCameraTest from '../components/PhoneCameraTest';
import MicrophoneTest from '../components/MicrophoneTest';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const CheckDevices = (props) => {
    const [isWebcamPlaying, setIsWebcamPlaying] = useState(false);
    const [isPhoneCameraPlaying, setIsPhoneCameraPlaying] = useState(false);


    const [isCameraAccessed, setIsCameraAccessed] = useState(null);
    const [isPhoneCameraAccessed, setIsPhoneCameraAccessed] = useState(null);
    const [isMicrophoneAccessed, setIsMicrophoneAccessed] = useState(null);

    const [isAllDevicesAccessed, setIsAllDevicesAccessed] = useState(null);



    let navigate = useNavigate();


    const socket = props.socket;

    useEffect(()=>{

        console.log("webcam: " + isCameraAccessed);
        console.log("phone: " + isPhoneCameraAccessed);
        console.log("microphone: " + isMicrophoneAccessed);

        if (isCameraAccessed === true && isPhoneCameraAccessed === true && isMicrophoneAccessed === true){
            setIsAllDevicesAccessed(true);
        }else if(isCameraAccessed != null && isPhoneCameraAccessed !== null && isMicrophoneAccessed !== null){
            setIsAllDevicesAccessed(false);
        }else{
            setIsAllDevicesAccessed(null);
        }

    }, [isCameraAccessed, isPhoneCameraAccessed, isMicrophoneAccessed])




    return (
        <div>
            <Navbar />
            <Container style={{marginTop: 5}}>
            <Typography marginTop={4} marginBottom={2} variant='h5'>Test des équipements</Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Card style={{padding: '10px'}}>
                            <Typography>Ordinateur: Caméra</Typography>
                            <CardContent>
                                {!isWebcamPlaying ? (
                                    <Button variant='contained' onClick={()=>setIsWebcamPlaying(true)}>Démarrer</Button> 
                                ):(
                                    <WebcamTest playing={isWebcamPlaying} isCameraAccessed={isCameraAccessed} setIsCameraAccessed={setIsCameraAccessed} />
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Card style={{padding: '10px'}}>
                            <Typography>Téléphone: Caméra</Typography>
                            <CardContent>
                                {!isPhoneCameraPlaying ? (
                                    <Button variant='contained' onClick={()=>setIsPhoneCameraPlaying(true)}>Démarrer</Button> 
                                ): (
                                    <PhoneCameraTest playing={isPhoneCameraPlaying} socket={socket} isPhoneCameraAccessed={isPhoneCameraAccessed} setIsPhoneCameraAccessed={setIsPhoneCameraAccessed} />
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card style={{padding: '10px'}}>
                            <Typography>Ordinateur: Microphone</Typography>
                            <MicrophoneTest isMicrophoneAccessed={isMicrophoneAccessed} setIsMicrophoneAccessed={setIsMicrophoneAccessed}/>
                        </Card>
                    </Grid>

                    {isAllDevicesAccessed !== null && (
                        <Grid item xs={12} md={12}>
                        <Card>
                            <CardContent>
                                <Box m={1} display="flex" justifyContent="space-between" alignItems="center">
                                    {isAllDevicesAccessed === false && (
                                        <Typography fontSize={14} fontWeight={500}><b style={{color: 'red'}}>Status(ERROR):</b> certains équipements sont indisponibles</Typography>    
                                    )}

                                    {isAllDevicesAccessed && (
                                        <>
                                            <Typography fontSize={14} fontWeight={500}><b style={{color: 'green'}}>Status(SUCCESS):</b> tous les équipements fonctionnent correctement</Typography>    
                                            <Button variant="contained" color="success" sx={{ height: 40 }} onClick={()=>navigate('/identity-control')}>Suivant</Button>

                                        </>                
                                    )}
                                </Box> 
                            </CardContent>                
                        </Card>
                    </Grid>
                    )}
                </Grid>
            </Container>
        </div>
  )
}

export default CheckDevices