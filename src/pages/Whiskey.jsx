import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useParams, useNavigate } from 'react-router-dom';

export default function Whiskey() {
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
            const avg =
              allRatings.reduce((sum, r) => sum + (Number(r.taste) || 0) + (Number(r.finish) || 0), 0) /
              allRatings.length;
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
      <table>
        <thead>
          <tr>
            <th>Nose</th>
            <th>Taste</th>
            <th>Body</th>
            <th>Complexity</th>
            <th>Balance</th>
            <th>Finish</th>
            <th>Uniqueness</th>
            <th>Drinkability</th>
            <th>Availability</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {myRating ? (
            <tr>
              <td>{myRating.nose}</td>
              <td>{myRating.taste}</td>
              <td>{myRating.body}</td>
              <td>{myRating.complexity}</td>
              <td>{myRating.balance}</td>
              <td>{myRating.finish}</td>
              <td>{myRating.uniqueness}</td>
              <td>{myRating.drinkability}</td>
              <td>{myRating.availability}</td>
              <td>{myRating.price}</td>
              <td>
                {[
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
                ].reduce((sum, key) => sum + (Number(myRating[key]) || 0), 0)}
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={11}>No rating yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Other Ratings</h2>
      <table>
        <thead>
          <tr>
            <th>Nose</th>
            <th>Taste</th>
            <th>Body</th>
            <th>Complexity</th>
            <th>Balance</th>
            <th>Finish</th>
            <th>Uniqueness</th>
            <th>Drinkability</th>
            <th>Availability</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.nose}</td>
                <td>{rating.taste}</td>
                <td>{rating.body}</td>
                <td>{rating.complexity}</td>
                <td>{rating.balance}</td>
                <td>{rating.finish}</td>
                <td>{rating.uniqueness}</td>
                <td>{rating.drinkability}</td>
                <td>{rating.availability}</td>
                <td>{rating.price}</td>
                <td>
                  {[
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
                  ].reduce((sum, key) => sum + (Number(rating[key]) || 0), 0)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11}>No other ratings</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
