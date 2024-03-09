import React from 'react'
import Navbar from '../components/Navbar'
import { Container, Typography } from '@mui/material'

const Home = () => {
  return (
    <div>
        <Navbar />
        <Container>
            <Typography variant='h5'>ExamApp</Typography>
        </Container>
    </div>
  )
}

export default Home