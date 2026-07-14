import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import FavoriteButton from "../components/FavoriteButton";
import { getCountries, getIndicators, getIndicatorData } from "../services/gho";
import '../assets/Dashboard.css';

function Dashboard() {
  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCountries()
      .then((data) => {
        setCountries(data);
        if (data.length > 0 && !data.some((c) => c.Code === selectedCountry)) {
          setSelectedCountry(data[0].Code);
        }
      })
      .catch((err) => console.error("Error fetching countries:", err));

    getIndicators()
      .then(setIndicators)
      .catch((err) => console.error("Error fetching indicators:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCountry || indicators.length === 0) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedStats = await Promise.all(
            indicators.map(async (indicator) => {
              const rows = await getIndicatorData(indicator.IndicatorCode, selectedCountry);
              const safeRows = Array.isArray(rows) ? rows : [];

              const cleaned = safeRows.filter((row) => {
                if (row.NumericValue == null) return false;
                if (!row.Dim1) return true;
                return row.Dim1 === "SEX_BTSX" || row.Dim1 === "BTSX";
              });

              const sortedRecords = cleaned.sort((a, b) => b.TimeDim - a.TimeDim);
              const latest = sortedRecords[0];

              return {
                id: indicator.id,
                code: indicator.IndicatorCode,
                name: indicator.IndicatorName,
                unit: indicator.unit,
                value: latest ? Math.round(latest.NumericValue * 10) / 10 : 'N/A',
                year: latest ? latest.TimeDim : 'Recent'
              };
            })
        );
        setStats(fetchedStats);
      } catch (err) {
        setError("Failed to load health statistics. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCountry, indicators]);

  const selectedCountryId = countries.find((c) => c.Code === selectedCountry)?.id;

  return (
      <main className="main-content">
        <Hero countryCount={countries.length} indicatorCount={indicators.length} />

        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">National Health Performance</h1>
            <p className="dashboard-subtitle">Key health markers tracked in our own database.</p>
          </div>

          {/* Country Selector */}
          <div className="selector-wrapper">
            <label htmlFor="country-select" className="selector-label">Select Country</label>
            <select
                id="country-select"
                className="country-select"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
            >
              {countries.map((country) => (
                  <option key={country.Code} value={country.Code}>
                    {country.Title}
                  </option>
              ))}
            </select>
          </div>
        </header>

        {/* Error state */}
        {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
        )}

        {/* Grid Layout of Cards */}
        <div className={`stats-grid ${loading ? 'grid-loading' : ''}`}>
          {stats.map((stat, index) => (
              <div
                  className="stat-card"
                  key={stat.code}
                  style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-card-header">
                  <span className="stat-badge">{stat.year}</span>
                </div>
                <h3 className="stat-name">{stat.name}</h3>
                <div className="stat-value-container">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-unit">{stat.unit}</span>
                </div>
                {selectedCountryId && (
                  <FavoriteButton countryId={selectedCountryId} indicatorId={stat.id} />
                )}
              </div>
          ))}
        </div>
      </main>
  );
}

export default Dashboard;
