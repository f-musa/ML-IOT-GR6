import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, CardContent, LinearProgress, Typography } from '@mui/material';
import microphoneON from '../assets/images/microphone.png';
import microphoneOFF from '../assets/images/microphone-off.png';

const MicrophoneTest = (props) => {
    const isMicrophoneAccessed = props.isMicrophoneAccessed;
    const setIsMicrophoneAccessed = props.setIsMicrophoneAccessed;
    const [isMicrophonePlaying, setIsMicrophonePlaying] = useState(false);
    const audioContextRef = useRef(null);
    const [audioData, setAudioData] = useState(0);

    useEffect(() => {
        let audioContext = audioContextRef.current;
        const startMicrophone = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (stream) {
                    setIsMicrophoneAccessed(true);
                    audioContext = new AudioContext();
                    audioContextRef.current = audioContext;
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const updateAudioData = () => {
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                        if(average > 100){
                            setAudioData(100);
                        }else{
                            setAudioData(average);
                        }
                        
                        requestAnimationFrame(updateAudioData);
                    };
                    updateAudioData();
                }
            } catch (error) {
                console.error('Error accessing microphone:', error);
                setIsMicrophoneAccessed(false);
            }
        };

        if (isMicrophonePlaying) {
            startMicrophone();
        } else {
            if (audioContext) {
                audioContext.close();
                audioContextRef.current = null;
            }
        }

        return () => {
            if (audioContext) {
                audioContext.close();
                audioContextRef.current = null;
            }
        };
    }, [isMicrophonePlaying,isMicrophoneAccessed, setIsMicrophoneAccessed]);

    const handleToggleMicrophone = () => {
        setIsMicrophonePlaying(prevState => !prevState);
    };

    return (
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button variant='contained' color={isMicrophonePlaying ? 'error' : 'primary'} onClick={handleToggleMicrophone}>
                    {isMicrophonePlaying ? 'Arrêter' : 'Démarrer'}
                </Button>
                <img src={isMicrophonePlaying ? microphoneON : microphoneOFF} className='microphone-img' alt={isMicrophonePlaying ? 'microphone_on' : 'microphone_off'} />
            </Box>
            {isMicrophonePlaying && (<LinearProgress variant="determinate" value={audioData} style={{marginTop: '10px'}} color={audioData < 80 ? 'primary' : 'red'} />)}
            {isMicrophoneAccessed === true && (<Typography color='green' fontSize={13} fontWeight='bold' style={{marginTop: '10px'}}>Status: disponible</Typography>)} 
            {isMicrophoneAccessed === false && (<Typography fontSize={13} fontWeight='bold' style={{marginTop: '10px', color: 'red'}}>Status: indisponible</Typography>)} 
        </CardContent>
    );
};

export default MicrophoneTest;
