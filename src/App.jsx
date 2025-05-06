import { useState, useRef, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount((prevCount) => prevCount + 1);
  }

  return (
    <div className='fullscreen'>
      <div>Whiskey App</div>
      <div>{count}</div>
      <button type='button' onClick={handleClick}>
        Count
      </button>
    </div>
  );
}
