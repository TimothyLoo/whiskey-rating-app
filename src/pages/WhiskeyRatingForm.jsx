import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useParams, useNavigate } from 'react-router-dom';

const initialFields = {
  nose: '',
  body: '',
  complexity: '',
  balance: '',
  uniqueness: '',
  drinkability: '',
  availability: '',
  price: '',
  taste: '',
  finish: '',
};

export default function WhiskeyRatingForm() {
  const [fields, setFields] = useState(initialFields);
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
          setFields({
            nose: data.nose || '',
            body: data.body || '',
            complexity: data.complexity || '',
            balance: data.balance || '',
            uniqueness: data.uniqueness || '',
            drinkability: data.drinkability || '',
            availability: data.availability || '',
            price: data.price || '',
            taste: data.taste || '',
            finish: data.finish || '',
          });
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
          setFields({
            nose: data.nose || '',
            body: data.body || '',
            complexity: data.complexity || '',
            balance: data.balance || '',
            uniqueness: data.uniqueness || '',
            drinkability: data.drinkability || '',
            availability: data.availability || '',
            price: data.price || '',
            taste: data.taste || '',
            finish: data.finish || '',
          });
          setRatingId(data.id);
        }
      }
    })();
  }, [id, routeRatingId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  }

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
      const { data, error } = await supabase.from('rating').update(fields).eq('id', ratingId);
      result = { data, error };
    } else {
      // Insert new rating
      const { data, error } = await supabase.from('rating').insert([{ ...fields, whiskey_fk: id, email: user.email }]);
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
        {/* Field configs for min/max */}
        {[
          { key: 'nose', min: 0, max: 10 },
          { key: 'taste', min: 0, max: 20 },
          { key: 'body', min: 0, max: 10 },
          { key: 'complexity', min: 0, max: 10 },
          { key: 'balance', min: 0, max: 10 },
          { key: 'finish', min: 0, max: 10 },
          { key: 'uniqueness', min: 0, max: 10 },
          { key: 'drinkability', min: 0, max: 10 },
          { key: 'availability', min: 0, max: 5 },
          { key: 'price', min: 0, max: 5 },
        ].map(({ key, min, max }) => (
          <div style={{ marginBottom: 16 }} key={key}>
            <label htmlFor={key} style={{ textTransform: 'capitalize' }}>
              {key}:
            </label>
            <input
              id={key}
              name={key}
              type='number'
              min={min}
              max={max}
              value={fields[key]}
              onChange={handleChange}
              style={{ width: '100%' }}
              inputMode='numeric'
              pattern='[0-9]*'
            />
          </div>
        ))}
        <button type='submit' disabled={loading}>
          {loading ? (ratingId ? 'Saving...' : 'Adding...') : ratingId ? 'Save Changes' : 'Add Rating'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
