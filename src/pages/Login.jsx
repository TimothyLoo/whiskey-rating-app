import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const sendMagicLink = async (e) => {
    e.preventDefault();

    const supabase = createClient(
      import.meta.env.VITE_REACT_APP_SUPABASE_URL,
      import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) {
      setError('Error sending magic link. Please try again.');
      setSuccess(null);
    } else {
      setSuccess('Magic link sent successfully! Please check your email.');
      setError(null);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={sendMagicLink}>
        <div>
          <label>Email: </label>
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type='submit'>Sign In</button>
      </form>
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default Login;
