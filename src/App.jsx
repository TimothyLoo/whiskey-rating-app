import { useState, useRef, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';
import { question, translateToJapanese } from './utils/queries';

export default function App() {
  const promptRef = useRef(null);
  const textContainerRef = useRef(null);

  useEffect(() => {
    promptRef.current.focus();
  }, []);

  const [conversation, setConversation] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePrompt(event) {
    setPrompt(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await question(prompt);
      const translate = await translateToJapanese(prompt);
      console.log('Translated:', translate);
      const updatedConversation = await [
        ...conversation,
        { role: 'user', content: prompt },
        { role: 'bot', content: data.response },
      ];
      setConversation(updatedConversation);
      setPrompt('');
      // Scroll to the bottom of the text container
      setTimeout(() => {
        if (textContainerRef.current) {
          textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        promptRef.current.focus();
      }, 0);
    }
  }

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  useEffect(() => {
    setPrompt(transcript); // update the input as the transcript updates
  }, [transcript]);

  const lang = 'ja-JP';

  const handleMicClick = (e) => {
    e.preventDefault();
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: lang });
    }
  };

  return (
    <div className='fullscreen'>
      <div className='text-container' ref={textContainerRef}>
        {conversation.map((item, index) => (
          <div key={index} className={item.role}>
            {item.content}
          </div>
        ))}
        {loading && <div className='spinner' />}
      </div>
      <div className='bottom-container'>
        <form className='bottom-form' onSubmit={handleSubmit}>
          <input ref={promptRef} className='form-input' value={prompt} onChange={handlePrompt} disabled={loading} />
        </form>
        <button className={`mic-button ${listening ? 'active' : ''}`} onClick={handleMicClick} title='Click to speak'>
          🎤
        </button>
      </div>
    </div>
  );
}
