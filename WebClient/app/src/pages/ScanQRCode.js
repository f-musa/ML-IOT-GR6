import React, { useEffect, useState } from 'react'
import AuthNavbar from '../components/AuthNavbar'
import { Alert, Box, Button, Card, CardContent, Container, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
// import { socket } from '../Utils'
// import { socket_connect } from '../ConnectionManager'

const ScanQRCode = (props) => {

    const [socketData, setSocketData] = useState([]);
    const [isMobileDeviceConnected, SetIsMobileDeviceConnected] = useState(false);

    const socket = props.socket;

    let location = useLocation();
    let navigate = useNavigate();

    const serverUrl = process.env.REACT_APP_SERVER_URL;

    let connectedUser = location.state.user;



    let valueQRcode = ''
    if (connectedUser) {
        valueQRcode = connectedUser.id + ";" + connectedUser.prenom + ";" + connectedUser.nom + ";" + connectedUser.email + ";" + serverUrl
    }

    useEffect(() => {


        const handleMobileDeviceConnected = (data) => {
            setSocketData(data);
            SetIsMobileDeviceConnected(true);
            console.log(data);

        }

        socket.on('mobile_device_connected', handleMobileDeviceConnected)

    }, [socketData, socket])
    return (
        <div>
            <AuthNavbar userName={localStorage.getItem('userName')}></AuthNavbar>
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
                        <Typography variant='h5'>Connecter votre appareil mobile</Typography>
                        <br />

                        <Card>
                            <CardContent>
                                {connectedUser && (
                                    <>
                                        {isMobileDeviceConnected && (
                                            <Alert variant="filled" severity="success" style={{ marginBottom: '10px' }}>Appareil mobile connecté avec succès</Alert>
                                        )}
                                        <Typography variant='h6'>Utilisateur connecté: </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemText
                                                    primary={"ID utilisateur: " + connectedUser.id}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText
                                                    primary={"Prénom et nom: " + connectedUser.prenom + " " + connectedUser.nom}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText
                                                    primary={"Email: " + connectedUser.email}
                                                />
                                            </ListItem>
                                        </List>

                                        {!isMobileDeviceConnected ? (
                                            <Box style={{ background: 'white', padding: '16px', textAlign: 'center' }}>
                                                <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>Scanner le QR code.</p>
                                                <QRCode value={valueQRcode} size={200} />
                                            </Box>
                                        ) : (
                                            <Box m={1} display="flex" justifyContent="flex-end" alignItems="flex-end">
                                                <Button variant="contained" color="success" sx={{ height: 40 }}
                                                    onClick={() => navigate('/check-devices')}
                                                >
                                                    Suivant
                                                </Button>
                                            </Box>
                                        )}


                                    </>
                                )}

                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

export default ScanQRCode