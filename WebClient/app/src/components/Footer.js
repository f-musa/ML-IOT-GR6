import { Fab } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { socket } from '../Utils';
import alertify from 'alertifyjs';

const Footer = () => {

	const [socketData, setSocketData] = useState(null);
    const [isMobileDisconnected, setIsMobileDisconneted] = useState(false);


    useEffect(()=>{

      const handleMicroserviceDisconnected = (data)=>{
          setSocketData(data);
          alertify.error(data?.message)
          if (data?.microservice == "MOBILE"){
            setIsMobileDisconneted(true);
          }
      }

      socket.on("microservice_disconnected", handleMicroserviceDisconnected);

    }, [socketData])
  return (
    <>
        {/* {isMobileDisconnected && (
            <Fab variant="extended">
                <PhoneIphoneIcon sx={{ mr: 1 }} />
                Smartphone déconnecté
            </Fab>
        )
        } */}
    </>
  )
}

export default Footer