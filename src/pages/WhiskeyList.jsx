import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

export default function WhiskeyList() {
  const [whiskeys, setWhiskeys] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  function handleClick(whiskeyId) {
    navigate(`${import.meta.env.BASE_URL}/whiskey/${whiskeyId}`);
  }

  return (
    <>
      <h1>Whiskey List</h1>
      <List>
        {whiskeys.map((whiskey) => (
          <div key={whiskey.id}>
            <ListItem onClick={() => handleClick(whiskey.id)}>
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
