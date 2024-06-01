import React from 'react';
import Quiz from '../components/Quiz';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import StatusIndicator from '../components/StatusIndicator';
import AuthNavbar from '../components/AuthNavbar';
import { useState } from 'react';
import ResultatQuiz from '../components/ResultatQuiz';
import questions from '../assets/questions'
import Footer from '../components/Footer';
import ExamComponent from '../components/ExamComponent';
const EtudiantHome = () => {
    const [cheatingResults, setCheatingResults] = useState([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const finishedQuiz = currentQuestionIndex === questions.length;
    const currentQuestion = questions[currentQuestionIndex];
    const goToNext = () => {
        setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
    }

    const submitAnswer = (newAnswer) => {
        setAnswers((currentAnswers) => [...currentAnswers, newAnswer]);
        goToNext();
    }

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setAnswers([]);
    }
    return (
        <>
            <AuthNavbar userName={localStorage.getItem('userName')}></AuthNavbar>
            <Container sx={{ marginTop: '10vh' }} width="80vw">
                <Grid container spacing={3}>
                    <Grid item xs={7}
                    >
                        {finishedQuiz ? <ResultatQuiz restartQuiz={restartQuiz} answers={answers} questions={questions} /> : <Quiz question={currentQuestion} questionNumber={currentQuestionIndex + 1}
                            submitAnswer={submitAnswer} />}
                    </Grid>
                    <Grid item xs={5}
                    >
                        <StatusIndicator cheatingResults={cheatingResults} currentQuestion={currentQuestion} />
                    </Grid>

                </Grid>

                <ExamComponent currentQuestion={currentQuestion} cheatingResults={cheatingResults} setCheatingResults={setCheatingResults} />

            <Footer />
            </Container>
        </>
    )
}

export default EtudiantHome