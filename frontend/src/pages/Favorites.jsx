import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, getCountries, getIndicators, addFavorite, deleteFavorite } from "../services/gho";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

function Favorites() {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("");
  const [formError, setFormError] = useState(null);

  const loadFavorites = () => {
    setLoading(true);
    setError(null);

    // The shared axios instance (services/gho.js -> api/axios.js) already
    // attaches the auth token via interceptor — no need to thread it through.
    Promise.all([getFavorites(), getCountries(), getIndicators()])
      .then(([favData, countryData, indicatorData]) => {
        setFavorites(favData);
        setCountries(countryData);
        setIndicators(indicatorData);

        if (countryData.length > 0 && !selectedCountryId) {
          setSelectedCountryId(String(countryData[0].id));
        }
        if (indicatorData.length > 0 && !selectedIndicatorId) {
          setSelectedIndicatorId(String(indicatorData[0].id));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedCountryId || !selectedIndicatorId) return;

    addFavorite({
      country_id: Number(selectedCountryId),
      indicator_id: Number(selectedIndicatorId),
    })
      .then((fav) => {
        setFavorites([...favorites, fav]);
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to save favorite"));
  };

  const handleDelete = (id) => {
    deleteFavorite(id)
      .then(() => setFavorites(favorites.filter((f) => f.id !== id)))
      .catch(() => setFormError("Failed to delete favorite"));
  };

  if (!isAuthenticated) {
    return (
      <main className="main-content">
        <div className="error-banner">Please log in to view your personalized favorites dashboard.</div>
      </main>
    );
  }

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <main className="main-content">
      <header className="page-header">
        <h1>My Favorites Dashboard</h1>
        <p>Logged in as: <strong>{user?.email}</strong></p>
      </header>

      <div className="filter-card" style={{ marginBottom: "1.5rem" }}>
        <h3 className="filter-label">Add an Indicator + Country to your Watchlist</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.5rem" }}>

          {/* Country Selection Dropdown */}
          <select
            className="filter-select"
            aria-label="Country"
            value={selectedCountryId}
            onChange={(e) => setSelectedCountryId(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.Title || c.name}
              </option>
            ))}
          </select>

          {/* New Phase 3 Indicator Dropdown Selection */}
          <select
            className="filter-select"
            aria-label="Indicator"
            value={selectedIndicatorId}
            onChange={(e) => setSelectedIndicatorId(e.target.value)}
          >
            {indicators.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name || i.IndicatorName}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary">
            Save to Watchlist
          </button>
        </form>
        {formError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      {favorites.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No metrics saved on your tracking list yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Tracked Indicator</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((fav) => {
              const country = countries.find((c) => c.id === fav.country_id);
              const indicator = indicators.find((i) => i.id === fav.indicator_id);
              const countryCode = country?.Code;
              return (
                <tr key={fav.id}>
                  <td>{country ? (country.Title || country.name) : `Country #${fav.country_id}`}</td>
                  <td>{indicator ? (indicator.name || indicator.IndicatorName) : `Indicator #${fav.indicator_id}`}</td>
                  <td style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    {countryCode && (
                      <Link to={`/trends?country=${countryCode}`}>View trends</Link>
                    )}
                    <button onClick={() => handleDelete(fav.id)} className="btn-danger">
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default Favorites;