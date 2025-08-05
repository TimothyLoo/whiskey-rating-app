import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function WhiskeyForm({ email, whiskey }) {
  const [name, setName] = useState(whiskey?.name || '');
  const [description, setDescription] = useState(whiskey?.description || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    async function fetchWhiskey() {
      if (id) {
        const { data, error } = await supabase.from('whiskey').select('*').eq('id', id).single();
        if (data) {
          setName(data.name || '');
          setDescription(data.description || '');
        }
        if (error) {
          setError(error.message);
        }
      } else if (whiskey) {
        setName(whiskey.name || '');
        setDescription(whiskey.description || '');
      }
    }
    fetchWhiskey();
  }, [id, whiskey]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let result;
    if (id) {
      // Edit whiskey
      const { data, error } = await supabase.from('whiskey').update({ name, description }).eq('id', id);
      result = { data, error };
    } else {
      // Add new whiskey
      const { data, error } = await supabase.from('whiskey').insert([{ name, description, email }]);
      result = { data, error };
    }
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      navigate(`${import.meta.env.BASE_URL}/whiskey`);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('whiskey').delete().eq('id', id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setName('');
      setDescription('');
      navigate(`${import.meta.env.BASE_URL}/whiskey`);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>{id ? `Edit ${name}` : 'Add New Whiskey'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor='name'>Name:</label>
          <input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor='description'>Description:</label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? (id ? 'Saving...' : 'Adding...') : id ? 'Save Changes' : 'Add Whiskey'}
        </button>
        {id && (
          <button type='button' style={{ marginLeft: 8 }} onClick={handleDelete} disabled={loading}>
            Delete Whiskey
          </button>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
