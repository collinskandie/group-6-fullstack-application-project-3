import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getFavorites, getCountries, addFavorite, deleteFavorite } from "../services/gho";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { AuthContext } from "../context/AuthContext"; // Pulling Rhoda's Auth Context

function Favorites() {
  const { token, user } = useContext(AuthContext); // Accessing token and user data
  const [favorites, setFavorites] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState(""); // Phase 3 Indicator addition
  const [formError, setFormError] = useState(null);

  // Hardcoded placeholders for indicators in case Shawn's indicator fetch service isn't built yet
  const fallbackIndicators = [
    { id: 1, name: "Life Expectancy at Birth", code: "WHOSIS_000001" },
    { id: 2, name: "Maternal Mortality Ratio", code: "MATERNAL_MORTALITY" }
  ];

  const loadFavorites = () => {
    setLoading(true);
    setError(null);
    
    // We pass the authentication token directly to the data services
    Promise.all([getFavorites(token), getCountries()])
      .then(([favData, countryData]) => {
        setFavorites(favData);
        setCountries(countryData);
        
        if (countryData.length > 0 && !selectedCountryId) {
          setSelectedCountryId(String(countryData[0].id));
        }
        if (fallbackIndicators.length > 0 && !selectedIndicatorId) {
          setSelectedIndicatorId(String(fallbackIndicators[0].id));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) {
      loadFavorites();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedCountryId || !selectedIndicatorId) return;

    // Send the country_id, indicator_id, and the auth token to the backend service
    addFavorite(
      { 
        country_id: Number(selectedCountryId), 
        indicator_id: Number(selectedIndicatorId) 
      }, 
      token
    )
      .then((fav) => {
        setFavorites([...favorites, fav]);
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to save favorite"));
  };

  const handleDelete = (id) => {
    // Pass token to allow secure ownership-checked deletes
    deleteFavorite(id, token)
      .then(() => setFavorites(favorites.filter((f) => f.id !== id)))
      .catch(() => setFormError("Failed to delete favorite"));
  };

  if (!token) {
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
        <label className="filter-label">Add an Indicator + Country to your Watchlist</label>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.5rem" }}>
          
          {/* Country Selection Dropdown */}
          <select
            className="filter-select"
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
            value={selectedIndicatorId}
            onChange={(e) => setSelectedIndicatorId(e.target.value)}
          >
            {fallbackIndicators.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{ background: "var(--color-primary)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", padding: "0.6rem 1.25rem", border: "none", borderRadius: "var(--radius)", cursor: "pointer" }}
          >
            Save to Watchlist
          </button>
        </form>
        {formError && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      {favorites.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No metrics saved on your tracking list yet.</p>
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
              const indicator = fallbackIndicators.find((i) => i.id === fav.indicator_id);
              const countryCode = country?.Code;
              return (
                <tr key={fav.id}>
                  <td>{country ? (country.Title || country.name) : `Country #${fav.country_id}`}</td>
                  <td>{indicator ? indicator.name : `Indicator #${fav.indicator_id}`}</td>
                  <td style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    {countryCode && (
                      <Link to={`/trends?country=${countryCode}`}>View trends</Link>
                    )}
                    <button
                      onClick={() => handleDelete(fav.id)}
                      style={{ background: "#d93025", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
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