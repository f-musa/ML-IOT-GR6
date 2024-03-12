import React from 'react'
import Navbar from '../components/Navbar'
import { Button, Container, Grid, Typography } from '@mui/material'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

function Login() {
    const randomUUID = uuidv4();
    let navigate = useNavigate();


    const handleLogin = ()=> {

        let userInfo = {
            user_id : randomUUID,
            first_name : "Amadou",
            last_name: "NGAM",
            email: "amadou@test.com"
        }

        navigate('/connect-mobile-device', {
            state: {
                user : userInfo
            }
        })
    }
  return (
    <div>
        <Navbar />
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
            <Typography variant='h5'>Se connecter</Typography>
            <br/>
            <Button variant='contained' onClick={handleLogin}>Connexion</Button>
            <Typography variant='small'> (Button) A remplacer par le formulaire de connexion</Typography>

           
            </Grid>
        </Grid>
        </Container>
    </div>
  )
}

export default Login