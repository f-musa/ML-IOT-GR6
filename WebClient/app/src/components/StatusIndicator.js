import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { Button } from "@mui/material";
import { socket } from "../Utils";
const StatusIndicator = (props) => {
    let cheatingResults = props.cheatingResults;
    let currentQuestion = props.currentQuestion;
    let prevQuestion = ''

    let user_id = localStorage.getItem('id')
    let prenom = localStorage.getItem('prenom')
    let nom = localStorage.getItem('nom')

    const [cheatingDetected, setCheatingDetected] = useState(false);

    const download_log_file = async () => {
    
        try {
          const response = await fetch("http://localhost:5000/download_log_file?user_id=" + user_id + "&prenom=" + prenom + "&nom="+ nom, {
            method: 'GET',
          });
    
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = user_id + "_" + prenom + "_" + nom + ".log";  // Use the filename provided by the user
            document.body.appendChild(a);
            a.click();
            a.remove();
          } else {
            console.error('Failed to download file');
          }
        } catch (error) {
          console.error('Error while downloading file', error);
        }
      };

    const [status, setStatus] = useState({'cheating': false});

    useEffect(()=>{
        for (let index = 0; index < cheatingResults.length; index++) {
            const res = cheatingResults[index];
            setStatus(res);

            if(res['cheating'] == true){
                setCheatingDetected(true)
            }
            
        }
    },[cheatingResults])

    useEffect(()=>{
        if(currentQuestion != prevQuestion){
            setStatus({'cheating': false})
            prevQuestion = currentQuestion;
            setCheatingDetected(false);
        }


    },[currentQuestion])
    return (
        <>
            <Card variant="outlined" sx={{ borderRadius: '10px' }}><Box
                component="span"
                sx={{ display: 'inline-block', transform: 'scale(0.8)' }}
            >
                <CardContent>
                    <Typography variant="h4" textAlign="left" component="div" >
                        Détecteur de triche
                    </Typography>

                    {cheatingDetected == true && (
                        <>
                            <Typography variant="h5" sx={{ mb: 1.5, textAlign: 'left', color: "red " }} >
                                Statut: Triche détecté
                            </Typography>
                            <Typography sx={{ mb: 1,fontSize:20, textAlign: 'left' }} >
                                Source: <b> {status['source']}</b>
                            </Typography>
                            {status['source'] != 'face_recognition' && (
                                <Typography  sx={{ mb: 1,fontSize:20, textAlign: 'left' }} >
                                confidence: <b> {status['score']*100} %</b>
                            </Typography>
                            )}
                            <Typography sx={{ mb: 1,fontSize:20, textAlign: 'left' }} >
                                message: <i style={{fontSize: 17}}>{status['message']}</i>
                            </Typography>
                            <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <SentimentVeryDissatisfiedIcon color="warning" sx={{ width: "30%", height: '30%' }}></SentimentVeryDissatisfiedIcon>
                            </Box>
                        </>)}

                     {(status['cheating'] == false && cheatingDetected == false) &&  (
                        <>
                        <Typography variant="h5" sx={{ mb: 1.5, textAlign: 'left' }} >
                            Statut: Triche non détecté
                        </Typography>
                        <Typography sx={{ mb: 1,fontSize:20, textAlign: 'left' }} >
                            Info: <i style={{fontSize: 19}}>{status['message'] ? status['message'] : "Aucune triche n'a été détecté pour cette question"}</i>
                        </Typography>
                        <Box style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <SentimentSatisfiedAltIcon color="success" sx={{ width: "30%", height: '30%' }}></SentimentSatisfiedAltIcon>
                        </Box>
                    </>
                     )}

                <Button style={{marginTop: 10}} onClick={download_log_file}>Télécharger les fichier logs</Button>
                </CardContent>
            </Box >
            </Card>
        </>
    )
};
export default StatusIndicator;