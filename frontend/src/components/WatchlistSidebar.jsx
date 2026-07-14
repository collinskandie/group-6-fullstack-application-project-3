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
    <div style={{
      position: "fixed",
      right: "24px",
      top: "100px",
      width: "260px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      zIndex: 1000
    }}>
      <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600" }}>Quick Watchlist</h3>
      <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 16px 0" }}>
        Bookmark countries to track their life expectancy statistics.
      </p>

      {error && <p style={{ color: "#dc2626", fontSize: "12px", margin: "0 0 12px 0" }}>{error}</p>}

      <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {countries.map((c) => {
          const isSaved = favorites.has(c.id);
          const isLoading = loadingId === c.id;

          return (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <span style={{ fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}>
                {c.Title || c.name}
              </span>
              <button
                onClick={() => handleSave(c.id)}
                disabled={isSaved || isLoading || !indicatorId}
                style={{
                  background: isSaved ? "#ecfdf5" : "#f3f4f6",
                  color: isSaved ? "#059669" : "#2563eb",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: isSaved ? "default" : "pointer"
                }}
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
