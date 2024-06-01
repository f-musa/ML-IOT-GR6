import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

const Quiz = ({ question, questionNumber, submitAnswer }) => {
    const [value, setValue] = useState(null);

    const handleChangeRadio = (e) => {
        setValue(e.target.value);
    }

    const handleSubmit = () => {
        submitAnswer(value);
        setValue(null);
    }
    return (

        <Box sx={{ minWidth: 275, }}>
            <Card variant="outlined" sx={{ borderRadius: "10px" }}>
                <CardContent>

                    <Typography variant="h5" component="div">
                        Question {questionNumber}
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {question.intitule}
                    </Typography>

                    <FormControl>
                        <RadioGroup name="radio-group-quiz" value={value} onChange={handleChangeRadio}>
                            {question.options.map((o, i) => {
                                return <FormControlLabel key={i + 1} value={i + 1} control={<Radio />} label={o} />
                            })}
                        </RadioGroup>
                    </FormControl>


                </CardContent>
                <CardActions>
                    <Button disabled={!value} onClick={handleSubmit} fullWidth variant="outlined" size="small">Question Suivante</Button>
                </CardActions>
            </Card>
        </Box>
    )
}
export default Quiz;
