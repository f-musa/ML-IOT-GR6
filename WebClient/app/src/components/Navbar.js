import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Navbar = (props) => {
    let navigate = useNavigate();
  //   let socket = props.socket;
	// const [socketData, setSocketData] = useState(null);


  //   useEffect(()=>{

  //     const handleMicroserviceDisconnected = (data)=>{
  //         setSocketData(data);
  //         console.log("--------------------Microservice disconnected",data);
  //     }

  //     socket.on("microservice_disconnected", handleMicroserviceDisconnected);

  //   }, [socketData])
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{cursor: 'pointer'}} onClick={()=> navigate('/')}>
            ExamApp
          </Typography>
         
          <Button color="inherit" onClick={()=> navigate('/login')}>Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Navbar