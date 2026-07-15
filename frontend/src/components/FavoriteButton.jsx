import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, addFavorite, deleteFavorite } from '../services/gho';

const FavoriteButton = ({ countryId, indicatorId }) => {
  const { isAuthenticated } = useAuth();
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    getFavorites()
      .then((favorites) => {
        if (cancelled) return;
        const match = favorites.find(
          (fav) => fav.country_id === countryId && fav.indicator_id === indicatorId
        );
        setFavoriteId(match ? match.id : null);
      })
      .catch((err) => console.error('Error fetching favorite status:', err));

    return () => {
      cancelled = true;
    };
  }, [countryId, indicatorId, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setError('Please log in to save favorites.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (favoriteId) {
        await deleteFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        const created = await addFavorite({ country_id: countryId, indicator_id: indicatorId });
        setFavoriteId(created.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorite.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="favorite-button-container">
      <button
        onClick={handleFavoriteToggle}
        disabled={loading}
        className={`fav-btn ${favoriteId ? 'active' : ''}`}
      >
        {loading ? 'Processing...' : favoriteId ? '★ Saved to Favorites' : '☆ Save to Favorites'}
      </button>
      {error && <p className="fav-error-text">{error}</p>}
    </div>
  );
};

export default FavoriteButton;
