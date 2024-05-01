import React from 'react'
import Navbar from '../components/Navbar'
import { Container, Typography } from '@mui/material'
import { socket } from '../Utils'

const Home = () => {
  return (
    <div>
        <Navbar socket={socket} />
        <Container>
            <Typography variant='h5'>ExamApp</Typography>
        </Container>
    </div>
  )
}

export default Home