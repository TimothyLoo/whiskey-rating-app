import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
import './App.css';
import Login from './pages/Login';
import WhiskeyList from './pages/WhiskeyList';
import Whiskey from './pages/Whiskey';
import WhiskeyForm from './pages/WhiskeyForm';
import WhiskeyRatingForm from './pages/WhiskeyRatingForm';

export default function App() {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const jwt = await JSON.parse(await localStorage.getItem('jwt'))?.expires_at;
      const currentTime = await Math.floor(Date.now() / 1000);
      if (!jwt || jwt < currentTime) {
        // put JWT in local storage from login hash
        const params = await new URLSearchParams(window.location.hash.substring(1));

        const result = {};
        for (const [key, value] of params.entries()) {
          result[key] = value;
        }
        await localStorage.setItem('jwt', JSON.stringify(result));
      }

      // set email from sb-* auth token if available
      const jwtKey = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
      if (jwtKey) {
        try {
          const tokenObj = JSON.parse(localStorage.getItem(jwtKey));
          if (tokenObj?.user?.email) {
            setEmail(tokenObj.user.email);
          }
        } catch (e) {
          // ignore parse errors
        }
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
    <>
      <Routes>
        <Route path={`${import.meta.env.BASE_URL}/login`} element={<Login email={email} setEmail={setEmail} />} />
        <Route path={`${import.meta.env.BASE_URL}/whiskey-list`} element={<WhiskeyList />} />
        <Route path={`${import.meta.env.BASE_URL}/whiskey/:id`} element={<Whiskey />} />
        <Route path={`${import.meta.env.BASE_URL}/whiskey/:id/add-rating`} element={<WhiskeyRatingForm />} />
        <Route path={`${import.meta.env.BASE_URL}/whiskey/new`} element={<WhiskeyForm email={email} />} />
        <Route path={`${import.meta.env.BASE_URL}/whiskey/:id/edit`} element={<WhiskeyForm email={email} />} />
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
      <button
        type='button'
        onClick={() => navigate(`${import.meta.env.BASE_URL}/whiskey-list`)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
        aria-label='Home'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='32'
          height='32'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M3 9.5L12 4l9 5.5' />
          <path d='M4 10v10h16V10' />
          <path d='M9 21V13h6v8' />
        </svg>
      </button>
    </>
  );
}
