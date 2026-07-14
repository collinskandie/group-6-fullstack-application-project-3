import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCountries, getIndicators, getFavorites, addFavorite } from "../services/gho";

const LIFE_EXPECTANCY_CODE = "WHOSIS_000001";

function WatchlistSidebar() {
  const { isAuthenticated } = useAuth();
  const [countries, setCountries] = useState([]);
  const [indicatorId, setIndicatorId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([getCountries(), getIndicators(), getFavorites()])
      .then(([countryData, indicatorData, favoriteData]) => {
        setCountries(countryData);

        const lifeExpectancy = indicatorData.find(
          (i) => i.code === LIFE_EXPECTANCY_CODE || i.IndicatorCode === LIFE_EXPECTANCY_CODE
        );
        if (!lifeExpectancy) return;
        setIndicatorId(lifeExpectancy.id);

        const alreadySaved = favoriteData
          .filter((f) => f.indicator_id === lifeExpectancy.id)
          .map((f) => f.country_id);
        setFavorites(new Set(alreadySaved));
      })
      .catch((err) => console.error("Failed to load watchlist data:", err));
  }, [isAuthenticated]);

  const handleSave = async (countryId) => {
    if (!indicatorId) return;
    setLoadingId(countryId);
    setError(null);

    try {
      await addFavorite({ country_id: Number(countryId), indicator_id: indicatorId });

      setFavorites((prev) => {
        const updated = new Set(prev);
        updated.add(countryId);
        return updated;
      });
    } catch (err) {
      setError("Could not save to favorites.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="watchlist-sidebar">
      <h3 className="watchlist-title">Quick Watchlist</h3>
      <p className="watchlist-subtitle">
        Bookmark countries to track their life expectancy statistics.
      </p>

      {error && <p className="watchlist-error">{error}</p>}

      <div className="watchlist-list">
        {countries.map((c) => {
          const isSaved = favorites.has(c.id);
          const isLoading = loadingId === c.id;

          return (
            <div key={c.id} className="watchlist-item">
              <span className="watchlist-item-name">{c.Title || c.name}</span>
              <button
                onClick={() => handleSave(c.id)}
                disabled={isSaved || isLoading || !indicatorId}
                className={`watchlist-add-btn ${isSaved ? "saved" : ""}`}
              >
                {isLoading ? "Saving..." : isSaved ? "✓ Saved" : "+ Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WatchlistSidebar;
