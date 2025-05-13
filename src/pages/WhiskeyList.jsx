import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';

export default function WhiskeyList() {
  const [whiskeys, setWhiskeys] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const access_token = await JSON.parse(await localStorage.getItem('jwt'))?.access_token;
      const refresh_token = await JSON.parse(await localStorage.getItem('jwt'))?.refresh_token;
      await supabase.auth.setSession({ access_token, refresh_token });

      const { data, error } = await supabase.from('whiskey').select('*');

      if (error) {
        setError(error);
      } else {
        setWhiskeys(data);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1>Whiskey List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <ul>
        {whiskeys.map((whiskey) => (
          <li key={whiskey.id}>
            <h2>{whiskey.name}</h2>
            <p>{whiskey.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
