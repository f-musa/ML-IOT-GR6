import React from 'react'
import { Typography, Card, CardContent, CardActions, Button } from '@mui/material'

import questions from "../assets/questions";

export default function ResultatQuiz(props) {
    const { answers, restartQuiz } = props;

    const correctAnswers = questions.filter((q, i) => {

        return parseInt(q.answer) === parseInt(answers[i]) - 1;
    }
    ).length

    return (
        <Card variant='outlined' sx={{ pt: 3, pb: 3 }}>
            <CardContent>
                <Typography sx={{ display: "flex", justifyContent: "center", mb: 3 }} variant="h4" color="text.secondary">
                    Resultat
                </Typography>
                <Typography sx={{ display: "flex", justifyContent: "center", mb: 3 }} variant="h4" color="text.secondary">
                    {correctAnswers} / {questions.length}
                </Typography>
            </CardContent>
            <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                <Button onClick={restartQuiz} variant="outlined">
                    Reinitialiser
                </Button>
            </CardActions>
        </Card>
    )
}