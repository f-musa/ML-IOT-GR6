// Mock de questions, a remplacer par donnees provenant de la bd
const questions = [
    {
        intitule: "Quel est l'objectif principal de l'apprentissage supervisé ?",
        options: ['Minimiser les erreurs de prédiction', "Maximiser l'efficacité computationnelle", "Prédire des événements futurs", 'Apprendre à partir de données non étiquetées'],
        answer: '0', // Index of the correct answer in the options array
    },
    {
        intitule: 'Lequel des algorithmes suivants est un exemple d\'algorithme d\'apprentissage non supervisé ?',
        options: ['Régression linéaire', "L'analyse en composante principale", 'Arbres de décision', 'Machines à vecteurs de support'],
        answer: '1',
    },
    {
        intitule: 'En classification, à quoi fait référence le terme "label" ?',
        options: ['Le nom du modèle', 'La sortie d\'un modèle de régression', 'La catégorie prédite d\'une entrée', 'Les caractéristiques d\'entrée d\'un modèle'],
        answer: '2',
    },
    {
        intitule: 'Quelle caractéristique de la Programmation Orientée Objet indique la réutilisabilité du code ?',
        options: ['Abstraction', 'Polymorphisme', 'Encapsulation', 'Héritage'],
        answer: '3',
    },
    {
        intitule: 'Quelle technologie est souvent utilisée pour la communication à courte portée dans les dispositifs IoT ?',
        options: ['Wi-Fi', 'Bluetooth', 'Ethernet', '5G'],
        answer: '1',
    }

];
export default questions;