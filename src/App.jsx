import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
import './App.css';
import Login from './pages/Login';
import WhiskeyList from './pages/WhiskeyList';
import Whiskey from './pages/Whiskey';

export default function App() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const jwt = await JSON.parse(await localStorage.getItem('jwt'))?.expires_at;
      const currentTime = await Math.floor(Date.now() / 1000);
      if (!jwt || jwt < currentTime) {
        // put JWT in local storage from login hash
        const params = await new URLSearchParams(window.location.hash.substring(1));

        const result = await {};
        for (const [key, value] of params.entries()) {
          result[key] = await value;
        }
        await localStorage.setItem('jwt', JSON.stringify(result));
      }

      // route if valid
      const jwtExpires = await JSON.parse(await localStorage.getItem('jwt'))?.expires_at;
      if (jwtExpires && jwtExpires > currentTime) {
        try {
          await navigate(`${import.meta.env.BASE_URL}/whiskey-list`);
        } catch (error) {
          await navigate(`${import.meta.env.BASE_URL}/login`);
        }
      } else {
        await navigate(`${import.meta.env.BASE_URL}/login`);
      }
    })();
  }, []);

  function handleClick() {
    setCount((prevCount) => prevCount + 1);
  }

  return (
    <Routes>
      <Route path={`${import.meta.env.BASE_URL}/login`} element={<Login />} />
      <Route path={`${import.meta.env.BASE_URL}/whiskey-list`} element={<WhiskeyList />} />
      <Route path={`${import.meta.env.BASE_URL}/whiskey/:id`} element={<Whiskey />} />
      <Route
        path={`${import.meta.env.BASE_URL}/*`}
        element={
          <div className='fullscreen'>
            <div>Whiskey App</div>
            <div>{count}</div>
            <button type='button' onClick={handleClick}>
              Count
            </button>
          </div>
        }
      />
    </Routes>
  );
}
