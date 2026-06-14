import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import '../assets/Dashboard.css';

const BASE_URL = "/api";

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const data = await res.json();

  return data;
}

// Core WHO GHO API health indicator codes
const TARGET_INDICATORS = [
  { code: 'WHOSIS_000001', name: 'Life Expectancy at Birth', unit: 'years' },
  { code: 'MDG_0000000001', name: 'Infant Mortality Rate', unit: 'per 1000 live births' },
  { code: 'WHOSIS_000015', name: 'Suicide Mortality Rate', unit: 'per 100,000' },
  { code: 'WHS6_102', name: 'Universal Health Coverage Index', unit: 'score' }
];

function Dashboard() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch('/Dimension/COUNTRY/DimensionValues');


        const records = data.value || [];
        const formattedCountries = records.map(c => ({
          code: c.Code,
          name: c.Title
        })).sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
      } catch (err) {
        console.error("Error fetching countries:", err);

        setCountries([
          {code: 'KEN', name: 'Kenya'},
          { code: 'USA', name: 'United States of America' },
          { code: 'CAN', name: 'Canada' },
          { code: 'GBR', name: 'United Kingdom' },
          { code: 'IND', name: 'India' },
          { code: 'AUS', name: 'Australia' }
        ]);
      }
    };

    fetchCountries();
  }, []);


  useEffect(() => {
    if (!selectedCountry) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedStats = await Promise.all(
            TARGET_INDICATORS.map(async (indicator) => {

              const data = await apiFetch(`/${indicator.code}?$filter=SpatialDim eq '${selectedCountry}'`);


              const records = data.value || [];
              const sortedRecords = records.sort((a, b) => b.TimeDim - a.TimeDim);
              const latest = sortedRecords[0];

              return {
                ...indicator,
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
  }, [selectedCountry]);

  return (
      <main className="main-content">
        <Hero />

        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">National Health Performance</h1>
            <p className="dashboard-subtitle">Key health markers sourced live from the WHO Global Health Observatory.</p>
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
                  <option key={country.code} value={country.code}>
                    {country.name}
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
              </div>
          ))}
        </div>
      </main>
  );
}

export default Dashboard;