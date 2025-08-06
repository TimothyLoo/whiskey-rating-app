import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useParams, useNavigate } from 'react-router-dom';

export default function WhiskeyRatingForm() {
  const [taste, setTaste] = useState('');
  const [finish, setFinish] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ratingId, setRatingId] = useState(null);
  const navigate = useNavigate();
  const { id, ratingId: routeRatingId } = useParams();

  useEffect(() => {
    (async () => {
      const jwtKey = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
      const jwtRaw = jwtKey ? localStorage.getItem(jwtKey) : null;
      const jwt = jwtRaw ? JSON.parse(jwtRaw) : null;
      const { access_token, refresh_token, user } = jwt || {};
      await supabase.auth.setSession({ access_token, refresh_token });
      if (routeRatingId) {
        // Edit mode: fetch by rating id
        const { data, error } = await supabase.from('rating').select('*').eq('id', routeRatingId).single();
        if (!error && data) {
          setTaste(data.taste || '');
          setFinish(data.finish || '');
          setRatingId(data.id);
        }
      } else {
        // Add mode: fetch by whiskey and email
        const { data, error } = await supabase
          .from('rating')
          .select('*')
          .eq('whiskey_fk', id)
          .eq('email', user.email)
          .single();
        if (!error && data) {
          setTaste(data.taste || '');
          setFinish(data.finish || '');
          setRatingId(data.id);
        }
      }
    })();
  }, [id, routeRatingId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const jwtKey = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
    const jwtRaw = jwtKey ? localStorage.getItem(jwtKey) : null;
    const jwt = jwtRaw ? JSON.parse(jwtRaw) : null;
    const { access_token, refresh_token, user } = jwt || {};
    await supabase.auth.setSession({ access_token, refresh_token });
    let result;
    if (ratingId) {
      // Update existing rating
      const { data, error } = await supabase.from('rating').update({ taste, finish }).eq('id', ratingId);
      result = { data, error };
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('rating')
        .insert([{ taste, finish, whiskey_fk: id, created_by: user.email }]);
      result = { data, error };
    }
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      navigate(`${import.meta.env.BASE_URL}/whiskey/${id}`);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>{ratingId ? 'Edit Rating' : 'Add Rating'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor='taste'>Taste:</label>
          <input
            id='taste'
            type='text'
            value={taste}
            onChange={(e) => setTaste(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor='finish'>Finish:</label>
          <input
            id='finish'
            type='text'
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? (ratingId ? 'Saving...' : 'Adding...') : ratingId ? 'Save Changes' : 'Add Rating'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
