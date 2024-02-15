import { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client'
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import makeStyles from '@emotion/styled'
import {Card, CardContent, Container, Grid} from '@mui/material';

import defaultImage from './assets/images/camera_unavailable.png';
import microphoneON from './assets/images/microphone.png';
import microphoneOFF from './assets/images/microphone-off.png';
import { concatenateLabels, sortByScore } from './Utils';

const socket = io.connect("http://127.0.0.1:5000");




const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
}));


function App() {

  const [videoPhoneUrl, setVideoPhoneUrl] = useState(defaultImage);
  const [videoWebcamUrl, setVideoWebcamUrl] = useState(defaultImage);
  const [microphoneIsON, setMicrophoneIsON] = useState(false);
  const [objectsDetected, setObjectDetected] = useState([]);


  const handleMicrophone = () =>{
    setMicrophoneIsON(!microphoneIsON);
  }


  useEffect(() => {
    const handleObjectDetectionStream = (data) => {
      if (data != null){
        const arrayBufferView = new Uint8Array(data);
        const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
        const urlCreator = window.URL || window.webkitURL;
        const newUrl = urlCreator.createObjectURL(blob);
  
        if (videoPhoneUrl) {
          urlCreator.revokeObjectURL(videoPhoneUrl);
        }
        setVideoPhoneUrl(newUrl);
      }else{
        setVideoPhoneUrl(defaultImage);
      }
    };

    const handleObjectLabel = (labels) =>{
      const labelsJSON = JSON.parse(labels);
      let sortedLabels = labelsJSON.sort(sortByScore);
      setObjectDetected(sortedLabels);


    }
  
    socket.on("object_detection_stream", handleObjectDetectionStream);
    socket.on("object_label", handleObjectLabel);
  
    return () => {
      socket.off("object_detection_stream", handleObjectDetectionStream);
    };
  }, [videoPhoneUrl]);
  
  const classes = useStyles();
  return (
<div className={classes.root}>
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" className={classes.title}>
        ExamApp
      </Typography>
      
    </Toolbar>
  </AppBar>
  
  <Container style={{marginTop: 10}}>
  <Grid container spacing={2}>
    <Grid item xs={12} md={4}>
      <Card style={{padding: 10}}>
        <Typography>Laptop camera</Typography>
        <CardContent>
          <img src={videoWebcamUrl} className='video-stream' alt='video' />
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card style={{padding: 10}}>
        <Typography>Mobile app camera</Typography>
        <CardContent>
          <img src={videoPhoneUrl} className='video-stream' alt='video' />
          {objectsDetected.length > 0 && (
            <div>
              <Typography style={{fontSize: 12, fontWeight: 'bold'}}>Objects detected: {concatenateLabels(objectsDetected)}</Typography> 

            </div>
          )}
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
    <Card style={{padding: 10}}>
      <Typography>Microphone</Typography>
        <CardContent>
          <div style={{textAlign: 'center'}}>
            {microphoneIsON ? (
              <>
                <img src={microphoneON} onClick={handleMicrophone} className='microphone-img' alt='video' />
                <Typography variant='h6' style={{fontSize: 12, fontWeight: 'bold'}}>Microphone ON</Typography> 
              </>
            ) : (
              <>
                <img src={microphoneOFF} onClick={handleMicrophone} className='microphone-img' alt='video' />
                <Typography variant='h6' style={{fontSize: 12, fontWeight: 'bold'}}>Microphone OFF</Typography> 
              </>
            )}

          </div>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={12} lg={12}></Grid>
      <Card style={{width: '100%'}}>
      <Typography variant='h6'>Status</Typography>
        <CardContent>
        <Typography variant='h6'></Typography>
        </CardContent>
      </Card>
  </Grid>
  </Container>
</div>

  );
}

export default App;
