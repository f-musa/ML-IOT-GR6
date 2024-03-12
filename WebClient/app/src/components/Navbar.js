import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    let navigate = useNavigate();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ExamApp
          </Typography>
         
          <Button color="inherit" onClick={()=> navigate('/login')}>Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Navbar