import React, { useState } from 'react';
import supabase from '../utils/supabase';

export default function Login({ email, setEmail }) {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3333/whiskey-rating-app'
        : 'https://timothyloo.github.io/whiskey-rating-app';

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);

    if (error) {
      setError('Error sending magic link. Please try again.');
      setSuccess(null);
    } else {
      setSuccess('Magic link sent successfully! Please check your email. You may close this window.');
      setError(null);
      setLoading(true);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={sendMagicLink}>
        <div>
          <label>Email: </label>
          <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? 'Sending...' : 'Sign In'}
        </button>
      </form>
      {loading && <div>Loading...</div>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}
