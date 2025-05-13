import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useParams } from 'react-router-dom';

export default function Whiskey() {
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    (async () => {
      const access_token = await JSON.parse(await localStorage.getItem('jwt'))?.access_token;
      const refresh_token = await JSON.parse(await localStorage.getItem('jwt'))?.refresh_token;
      await supabase.auth.setSession({ access_token, refresh_token });

      const { data, error } = await supabase.from('rating').select('*').eq('whiskey_fk', id);

      if (error) {
        setError(error);
      } else {
        setRatings(data);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1>Whiskey</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <ul>
        {ratings.map((rating) => (
          <li key={rating.id}>
            <h2>{rating.taste}</h2>
            <h2>{rating.finish}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
