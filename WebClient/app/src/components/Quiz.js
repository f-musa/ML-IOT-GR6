import React, { useState } from 'react';
import { Paper, Typography, Button, Radio, FormControlLabel, Grid } from '@mui/material';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

const Quiz = ({ quiz }) => {
    const [current, setCurrent] = useState(0);
    const [selectedValue, setSelectedValue] = useState('0');
    const [revealed, setRevealed] = useState(false);

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const moveNext = () => {
        clearBacks();
        setCurrent(current + 1);
    };

    const movePrevious = () => {
        clearBacks();
        setCurrent(current - 1);
    };

    const clearBacks = () => {
        const question = quiz[current];
        question.options.forEach((_, index) => {
            const element = document.getElementById(index.toString());
            if (element) {
                element.style.background = 'white';
            }
        });
    };

    const revealCorrect = () => {
        const question = quiz[current];
        const answer = question.answer;
        clearBacks();
        if (selectedValue === answer) {
            document.getElementById(answer).style.background = 'lightgreen';
        } else {
            document.getElementById(answer).style.background = 'lightgreen';
            document.getElementById(selectedValue).style.background = 'lightcoral';
        }
        setRevealed(true);
    };

    const renderOptions = (options) => {
        return options.map((opt, index) => (
            <Grid item key={index}>
                <FormControlLabel
                    value={index.toString()}
                    control={<Radio />}
                    label={opt}
                    checked={selectedValue === index.toString()}
                    onChange={handleChange}
                />
            </Grid>
        ));
    };

    const question = quiz[current];
    const curQuestion = current + 1;
    const size = quiz.length;
    const moveRight = current + 1 < quiz.length;
    const moveLeft = current === 0;

    return (
        <Paper elevation={4} style={{ padding: '16px', marginTop: '24px', width: '60%', margin: '0 auto' }}>
            <Typography component="p" style={{ marginBottom: '20px' }}>
                <Button variant="contained" color="primary" style={{ pointerEvents: 'none', boxShadow: 'none' }}>
                    <LiveHelpIcon />
                </Button>
                <span style={{ marginLeft: '10px', display: 'inline' }}>Question # {curQuestion} / {size}</span>
            </Typography>
            <Typography variant="h5" component="h2" style={{ marginBottom: '20px' }}>
                {question.question}
            </Typography>
            <Grid container spacing={2}>
                {renderOptions(question.options)}
            </Grid>
            <div style={{ marginTop: '40px' }}>
                <Button variant="contained" color="secondary" onClick={revealCorrect}>
                    Submit
                </Button>
                <Button variant="contained" color="primary" onClick={moveNext} disabled={!moveRight} style={{ float: 'right' }}>
                    Next
                </Button>
                <Button variant="contained" color="primary" onClick={movePrevious} disabled={!moveLeft} style={{ float: 'right', marginRight: '50px' }}>
                    Previous
                </Button>
            </div>
        </Paper>
    );
};

export default Quiz;
