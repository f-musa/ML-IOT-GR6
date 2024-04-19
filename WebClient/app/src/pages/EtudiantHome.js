import React from 'react';
import { useNavigate } from 'react-router-dom';
import Quiz from '../components/Quiz';

const EtudiantHome = () => {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.clear();
        navigate('/login');

    }
    const questions = [
        {
            question: 'Quel est la capitale de la france?',
            options: ['Paris', 'London', 'Berlin', 'Rome'],
            answer: '0', // Index of the correct answer in the options array
        },
        {
            question: 'Qui a ecrit karamazov ?',
            options: ['Shakespeare', 'Hemingway', 'Tolstoy', 'Dostoevsky'],
            answer: '3',
        },

        {
            question: `Quel equipe a remporte la dernière coupe d'afrique  ?`,
            options: ['Ghana', 'CIV', 'Algerie', 'Cap-Vert'],
            answer: '1',
        },

        // Add more questions as needed
    ];
    return (
        <>
            <h1>Student Home</h1>
            <Quiz quiz={questions}></Quiz>
            <button onClick={logout}>
                Se deconnecter
            </button>
        </>
    )
}

export default EtudiantHome
