import { useState } from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
const StatusIndicator = () => {
    const [status, setStatus] = useState(false);
    return (
        <>
            <Card variant="outlined" sx={{ borderRadius: '10px' }}><Box
                component="span"
                sx={{ display: 'inline-block', transform: 'scale(0.8)' }}
            >
                <CardContent>
                    <Typography variant="h4" textAlign="left" component="div">
                        Detecteur de triche
                    </Typography>

                    {!status ?
                        <>
                            <Typography variant="h5" sx={{ mb: 1.5, textAlign: 'left', color: "red " }} >
                                Triche détecté
                            </Typography>
                            <SentimentVeryDissatisfiedIcon color="warning" sx={{ width: "80%", height: '80%', marginLeft: '50%' }}></SentimentVeryDissatisfiedIcon>
                        </>
                        :

                        <>
                            <Typography variant="h5" sx={{ mb: 1.5, textAlign: 'left', color: "green" }} >
                                Tout se passe bien
                            </Typography>
                            <SentimentSatisfiedAltIcon color="success" sx={{ width: "80%", height: '80%', marginLeft: '50%' }}></SentimentSatisfiedAltIcon>
                        </>
                    }
                </CardContent>
            </Box >
            </Card>
        </>
    )
};
export default StatusIndicator;