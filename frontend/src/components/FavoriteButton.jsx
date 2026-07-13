import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; 

const FavoriteButton = ({ countryId, indicatorId }) => {
  const { user, token } = useContext(AuthContext);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!user || !token) return;

    const checkFavoriteStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const match = response.data.find(
          (fav) => fav.country_id === countryId && fav.indicator_id === indicatorId
        );
        if (match) setIsFavorited(true);
      } catch (err) {
        console.error("Error fetching favorite status:", err);
      }
    };

    checkFavoriteStatus();
  }, [countryId, indicatorId, user, token, API_BASE_URL]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      setError("Please log in to save favorites.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFavorited) {
        const res = await axios.get(`${API_BASE_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const target = res.data.find(
          (fav) => fav.country_id === countryId && fav.indicator_id === indicatorId
        );
        
        if (target) {
          await axios.delete(`${API_BASE_URL}/favorites/${target.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsFavorited(false);
        }
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites`,
          { country_id: countryId, indicator_id: indicatorId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update favorite.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; 

  return (
    <div className="favorite-button-container">
      <button 
        onClick={handleFavoriteToggle} 
        disabled={loading}
        className={`fav-btn ${isFavorited ? 'active' : ''}`}
      >
        {loading ? 'Processing...' : isFavorited ? '★ Saved to Favorites' : '☆ Save to Favorites'}
      </button>
      {error && <p className="fav-error-text">{error}</p>}
    </div>
  );
};

export default FavoriteButton;