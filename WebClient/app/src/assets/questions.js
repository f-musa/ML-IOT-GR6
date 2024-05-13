// Mock de questions, a remplacer par donnees provenant de la bd
const questions = [
    {
        intitule: 'Quel est la capitale de la france?',
        options: ['Paris', 'London', 'Berlin', 'Rome'],
        answer: '0', // Index of the correct answer in the options array
    },
    {
        intitule: 'Qui a ecrit karamazov ?',
        options: ['Shakespeare', 'Hemingway', 'Tolstoy', 'Dostoevsky'],
        answer: '3',
    },

    {
        intitule: `Quel equipe a remporte la dernière coupe d'afrique  ?`,
        options: ['Ghana', 'CIV', 'Algerie', 'Cap-Vert'],
        answer: '1',
    },

];
export default questions;