import React, { useState } from 'react';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login({ email, setEmail }) {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const lowerEmail = email.toLowerCase();

    const { error } = await supabase.auth.signInWithOtp({
      email: lowerEmail,
    });

    setLoading(false);

    if (error) {
      setError('Error sending OTP. Please try again.');
      setSuccess(null);
    } else {
      setSuccess('OTP sent successfully! Please check your email for the code.');
      setOtpSent(true);
      setError(null);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const lowerEmail = email.toLowerCase();
    const { data, error } = await supabase.auth.verifyOtp({
      email: lowerEmail,
      token: otp,
      type: 'email',
    });
    setLoading(false);
    if (error) {
      setError('Invalid OTP. Please try again.');
    } else {
      setSuccess('Login successful! Redirecting...');
      navigate(`${import.meta.env.BASE_URL}/whiskey-list`);
    }
  };

  return (
    <div>
      <h2>Login with Email OTP</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!otpSent ? (
        <form onSubmit={sendOtp}>
          <div className='login-form-row'>
            <label>Email: </label>
            <input
              className='login-input'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              disabled={loading}
            />
          </div>
          <button type='submit' disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <div className='login-form-row'>
            <label>Email: </label>
            <input className='login-input login-input-disabled' type='email' value={email.toLowerCase()} disabled />
          </div>
          <div className='login-form-row'>
            <label>Enter OTP: </label>
            <input
              className='login-input login-otp-input'
              type='number'
              inputMode='numeric'
              pattern='[0-9]*'
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              disabled={loading}
            />
          </div>
          <button type='submit' disabled={loading || !otp}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
      {loading && <div>Loading...</div>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}
