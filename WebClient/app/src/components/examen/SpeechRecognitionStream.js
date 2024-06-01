import { HelpOutline } from '@mui/icons-material';
import React, { useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { socket } from '../../Utils';

const SpeechRecognitionStream = (props) => {

    const setTranscription = props.setTranscription;
    const playing = props.playing;
    const sentence_similarity = props.sentence_similarity;
    const setSsResults = props.setSsResults;
    const currentQuestion = props.currentQuestion;
    const resetListening = props.resetListening;

    const [transcriptPrev, setTranscriptPrev] = useState('-11111');
    const [QuestionPrev, setQuestionPrev] = useState();


    const handle_sentence_similarity_result = (ssResults) =>{
      setSsResults(ssResults)
    }


    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();
    
      if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
      }

      if(playing){
        SpeechRecognition.startListening({ continuous: true });
        setTranscription(transcript)

      }else{
        SpeechRecognition.stopListening();
        setTranscription(transcript)

      }
      
      if(sentence_similarity){
        if (transcript != ''){
          const words = transcript.split(' ');
          const words15 = words.slice(-15);
          const text = words15.join(' ');
          // récuperer la réponse: 
          const response_index = currentQuestion['answer']
          const response = currentQuestion['options'][response_index]

          if (transcriptPrev != transcript){
            socket.emit('microphone_transcription', { transcription: text, answer: response });
            setTranscriptPrev(transcript)
          }
        }

        socket.on('sentence_similarity_result', handle_sentence_similarity_result)
      }

      if(QuestionPrev != currentQuestion){
        resetTranscript();
        setTranscriptPrev('-111111')
        setQuestionPrev(currentQuestion)
      }

}

export default SpeechRecognitionStream