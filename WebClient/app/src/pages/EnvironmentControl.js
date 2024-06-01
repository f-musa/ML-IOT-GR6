import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { Alert, Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material'
import studentDesktop from '../assets/images/student_desktop.png'
import { socket } from '../Utils'
import PhoneCamera from '../components/PhoneCamera'
import { useNavigate } from 'react-router-dom'
import AuthNavbar from '../components/AuthNavbar'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ErrorIcon from '@mui/icons-material/Error';

const EnvironmentControl = () => {
    const [startEnvControl, setStartEnvControl] = useState(false);
    const [seconds, setSeconds] = useState(30);
    const [environnmentResult, setEnvironnmentResult] = useState([]);
    const [inProcess, setInProcess] = useState();
    const [unAuthorizeObjectDetected, setUnAuthorizeObjectDetected] = useState(false);
    const [laptopDetected, setLaptopDetected] = useState(false);
    let navigate = useNavigate();
    var timer;

    const restartScan = () =>{
        setStartEnvControl(false);
        setSeconds(30);
        setEnvironnmentResult([]);
        setInProcess(null);
        setUnAuthorizeObjectDetected(false);
        setLaptopDetected(false);
        setStartEnvControl(true);
    }
    useEffect(()=>{

        timer = setInterval(()=>{
           if(startEnvControl == true){
            if (seconds == 0){
            setSeconds(0);
                
            }else{
            setSeconds(seconds - 1);
            }
           }
        }, 1000)

        return () => clearInterval(timer);

       
    })

    useEffect(()=>{
        if (seconds == 0){
            clearInterval(timer);
        }

    },[seconds])


    useEffect(()=>{
        for (let index = 0; index < environnmentResult.length; index++) {
            const result = environnmentResult[index];
            if (result['label_name'] == 'laptop'){
              setLaptopDetected(true);
            }else{
              setUnAuthorizeObjectDetected(true);
            }
            
          }
    },[environnmentResult])
  return (
    <div>
        {localStorage.getItem('userName') ? (
            <AuthNavbar userName={localStorage.getItem('userName')}></AuthNavbar>
        ):(
            <Navbar socket={socket}/>
        )}
        <Container>

            <Grid
                container
                spacing={0}
                alignItems="center"
                justifyContent="space-between"
                sx={{ minHeight: '100vh' }}
                >
                <Grid item xs={3} md={7}>
                    <Typography variant='h5'>Scan de l'environnement autour</Typography>
                    <Card>
                    <CardContent>
                        {/* <Typography fontSize={14}>Avec la caméra frontale: veuillez positionner votre téléphone sur votre front.</Typography>
                        <Typography fontSize={14} marginBottom={2}>Scanner tout l'environnement de gauche à droite pendant 10 secondes .</Typography> */}

                        {!startEnvControl ? (
                                <>
                                <Box display='flex' flexDirection='column'  style={{margin: '10px'}} alignItems='center'>
                                    <img
                                        alt='camera'
                                        src={studentDesktop}
                                        style={{width: '200px', marginBottom: '10px'}}
                                    />
                                    <Button  variant="contained" onClick={()=>setStartEnvControl(true)}>Démarrer le scan</Button>
                                </Box>
                               
                                </>
                        ):(
                            <>
                                <PhoneCamera socket={socket} playing={true} seconds={seconds} setEnvironnmentResult={setEnvironnmentResult} setInProcess={setInProcess}/>
                            </>
                        )
                        }
                    </CardContent>
                </Card>
                </Grid>
                <Grid item xs={3} md={5}>
                <Card style={{marginLeft: 10}}>
                    <CardContent>
                        {seconds != 0 && (
                            <>
                                 <Typography fontSize={14} marginBottom={2}><b><i>Consignes:</i></b></Typography>
                                <Typography fontSize={12}>Avec la caméra frontale: veuillez positionner votre téléphone sur votre front et scanner tout l'environnement de gauche à droite pendant {seconds} secondes. Appuyer sur <b>"DEMARRER LE SCAN"</b></Typography>
                                <Typography variant='h5' style={{textAlign: 'center', marginTop: 5}}>{seconds} secondes</Typography>

                            </>
                        )}

                        {inProcess == true && (
                                <Typography variant='h5' style={{textAlign: 'center', marginTop: 5}}>Analyse en cours ...</Typography>
                        )}

                        {(inProcess == false && seconds == 0) && (
                           <>
                                <Typography fontSize={14} marginBottom={2}><b>Résultats du scan:</b></Typography>
                                {(unAuthorizeObjectDetected == false && laptopDetected == true) && (
                                   <>
                                    <Alert icon={<ThumbUpIcon fontSize="inherit" />} severity="success">Scan reussi! Appuyer sur <b>"Commencer l'examen"</b></Alert>
                                    <Button variant='contained' color="success"  style={{marginTop: 10}} onClick={()=> navigate('/examen')}>Commencer l'examen</Button>

                                   </>
                                )}

                                {(unAuthorizeObjectDetected == true) && (
                                   <>
                                     <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">Nous avons détecté des objets de triches. Veuillez déplacer ces objects et "Appuyer à nouveau sur  <b>"RECOMMENCER LE SCAN"</b> </Alert>
                                     <Typography fontSize={14} >Objets détectés: </Typography>
                                     {environnmentResult.map(object => (
                                        (object['label_name'] != 'laptop') && (
                                            <Typography fontSize={13} marginLeft={5} key={object['label_name']}>
                                            <b>{object['label_name']} (score : {object['mean_score'].toFixed(2)} --- fréquence: {object['frequence']})</b>
                                        </Typography>
                                        )
                                        ))}
                                   </>

                                )}
                                  {(laptopDetected == false) && (
                                    <>
                                         <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">Nous n'avons pas détecter l'ordinateur indispensable pour passer l'examen. "Appuyer à nouveau sur <b>"RECOMMENCER LE SCAN"</b></Alert>

                                    </>
                                )}                            
                           </> 
                        )}

                        {(unAuthorizeObjectDetected == true || (laptopDetected == false && seconds == 0)) && (
                            <Button  style={{marginTop: 10}} variant="contained" onClick={()=> restartScan()}>Recommencer le scan</Button>
                        )}
                    </CardContent>
                </Card>

                </Grid>

              
            </Grid>
        </Container>
    </div>
  )
}

export default EnvironmentControl