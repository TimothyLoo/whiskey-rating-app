import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useParams, useNavigate } from 'react-router-dom';

export default function Whiskey() {
  const RATING_KEYS = [
    'nose',
    'taste',
    'body',
    'complexity',
    'balance',
    'finish',
    'uniqueness',
    'drinkability',
    'availability',
    'price',
  ];

  function getTotal(rating) {
    return RATING_KEYS.reduce((sum, key) => sum + (Number(rating[key]) || 0), 0);
  }

  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const jwtKey = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
      const jwtRaw = jwtKey ? localStorage.getItem(jwtKey) : null;
      const jwt = jwtRaw ? JSON.parse(jwtRaw) : null;
      const { access_token, refresh_token, user } = jwt || {};
      await supabase.auth.setSession({ access_token, refresh_token });

      const { data, error } = await supabase.from('rating').select('*').eq('whiskey_fk', id);

      if (error) {
        setError(error);
      } else {
        // Separate my rating from others by email
        const my = data.find((r) => r.created_by === user.email);
        setMyRating(my || null);
        setRatings(data.filter((r) => r.created_by !== user.email));
      }
      setLoading(false);
    })();
  }, []);

  function handleAddRating() {
    navigate(`${import.meta.env.BASE_URL}/whiskey/${id}/add-rating`);
  }

  const [whiskeyName, setWhiskeyName] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('whiskey').select('name').eq('id', id).single();
      if (!error && data) {
        setWhiskeyName(data.name);
      }
    })();
  }, [id]);

  return (
    <div>
      <h1>{whiskeyName || 'Whiskey'}</h1>
      {!loading && (
        <div style={{ marginBottom: '16px' }}>
          <strong>Average Rating: </strong>
          {(() => {
            const allRatings = [...(myRating ? [myRating] : []), ...ratings];
            if (allRatings.length === 0) return 'N/A';
            const avg = allRatings.reduce((sum, r) => sum + getTotal(r), 0) / allRatings.length;
            return avg.toFixed(2);
          })()}
        </div>
      )}
      <button
        style={{ marginBottom: '16px' }}
        onClick={() => {
          if (myRating) {
            navigate(`${import.meta.env.BASE_URL}/whiskey/${id}/edit-rating/${myRating.id}`);
          } else {
            navigate(`${import.meta.env.BASE_URL}/whiskey/${id}/add-rating`);
          }
        }}>
        {myRating ? 'Edit Rating' : 'Add Rating'}
      </button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <h2>My Rating</h2>
      <div className='whiskey-table-container'>
        <table>
          <thead>
            <tr>
              <th>Total</th>
              {RATING_KEYS.map((key) => (
                <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myRating ? (
              <tr>
                <td>{getTotal(myRating)}</td>
                {RATING_KEYS.map((key) => (
                  <td key={key}>{myRating[key]}</td>
                ))}
              </tr>
            ) : (
              <tr>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No rating yet</td>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No rating yet</td>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No rating yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Other Ratings</h2>
      <div className='whiskey-table-container'>
        <table>
          <thead>
            <tr>
              <th>Total</th>
              {RATING_KEYS.map((key) => (
                <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <tr key={rating.id}>
                  <td>{getTotal(rating)}</td>
                  {RATING_KEYS.map((key) => (
                    <td key={key}>{rating[key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No other ratings</td>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No other ratings</td>
                <td colSpan={(RATING_KEYS.length + 1) / 3}>No other ratings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
