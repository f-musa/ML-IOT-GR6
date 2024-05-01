import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material'
import studentDesktop from '../assets/images/student_desktop.png'
import { socket } from '../Utils'
import PhoneCamera from '../components/PhoneCamera'

const EnvironmentControl = () => {
    const [startEnvControl, setStartEnvControl] = useState(false);
  return (
    <div>
        <Navbar socket={socket}/>
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
                    <Typography variant='h5'>Scan de l'environnement autour</Typography>
                    <Card>
                    <CardContent>
                        <Typography fontSize={14} marginBottom={2}>Avec la caméra frontale: veuillez positionner votre téléphone sur votre front.</Typography>

                        {!startEnvControl ? (
                                <>
                                <Box display='flex' flexDirection='column'  style={{margin: '10px'}} alignItems='center'>
                                    <img
                                        alt='camera'
                                        src={studentDesktop}
                                        style={{width: '180px', marginBottom: '10px'}}
                                    />
                                    <Button  variant="contained" onClick={()=>setStartEnvControl(true)}>Démarrer le scan</Button>
                                </Box>
                               
                            </>
                        ):(
                            <>
                            <PhoneCamera socket={socket} playing={true}/>
                            </>
                        )
                        }
                    </CardContent>
                </Card>
                </Grid>
              
            </Grid>
        </Container>
    </div>
  )
}

export default EnvironmentControl