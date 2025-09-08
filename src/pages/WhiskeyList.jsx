import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import WhiskeyForm from './WhiskeyForm';

export default function WhiskeyList() {
  const [whiskeys, setWhiskeys] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const jwtKey = Object.keys(localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
      const jwtRaw = jwtKey ? localStorage.getItem(jwtKey) : null;
      const jwt = jwtRaw ? JSON.parse(jwtRaw) : null;
      const { access_token, refresh_token, user } = jwt || {};
      const lowerEmail = (user?.email || '').toLowerCase();
      await supabase.auth.setSession({ access_token, refresh_token });

      const { data, error } = await supabase.from('whiskey').select('*');

      if (error) {
        setError(error);
      } else {
        // If you need to filter or compare by created_by, do so in lowercase
        setWhiskeys(data.map((w) => ({ ...w, created_by: (w.created_by || '').toLowerCase() })));
      }
      setLoading(false);
    })();
  }, []);

  function handleClick(whiskeyId) {
    navigate(`${import.meta.env.BASE_URL}/whiskey/${whiskeyId}`);
  }

  return (
    <>
      <h1>Whiskey List</h1>
      <button style={{ marginBottom: '16px' }} onClick={() => navigate(`${import.meta.env.BASE_URL}/whiskey/new`)}>
        Add New Whiskey
      </button>
      <List>
        {whiskeys.map((whiskey) => (
          <div key={whiskey.id}>
            <ListItem
              secondaryAction={
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '8px',
                  }}
                  title='Edit'
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${import.meta.env.BASE_URL}/whiskey/${whiskey.id}/edit`);
                  }}>
                  <span role='img' aria-label='edit'>
                    ✏️
                  </span>
                </button>
              }
              onClick={() => handleClick(whiskey.id)}>
              <ListItemAvatar>
                <Avatar alt={whiskey.name} src={undefined} />
              </ListItemAvatar>
              <ListItemText primary={whiskey.name} secondary={undefined} />
            </ListItem>
            <Divider variant='inset' component='li' />
          </div>
        ))}
      </List>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </>
  );
}
