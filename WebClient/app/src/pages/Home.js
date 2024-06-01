import React from 'react'
import Navbar from '../components/Navbar'
import { Container, Typography } from '@mui/material'
import { socket } from '../Utils'
import AuthNavbar from '../components/AuthNavbar'

const Home = () => {
  return (
    <div>
         {localStorage.getItem('userName') ? (
            <AuthNavbar userName={localStorage.getItem('userName')}></AuthNavbar>
            ):(
                <Navbar socket={socket}/>
            )}
        <Container>
            <Typography variant='h5'>ExamApp</Typography>
        </Container>
    </div>
  )
}

export default Home