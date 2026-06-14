import { useEffect, useState } from "react";
import TrendsHero from "../components/TrendsHero";
import { getCountries, getIndicators, getIndicatorData } from "../services/gho";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function Trends() {
  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("KEN");
  const [selectedIndicator, setSelectedIndicator] = useState("WHOSIS_000001");
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load countries + indicators
  useEffect(() => {
    async function loadFilters() {
      try {
        const [countryData, indicatorData] = await Promise.all([
          getCountries(),
          getIndicators(),
        ]);
        setCountries(countryData);
        setIndicators(indicatorData);
      } catch (err) {
        setError(err.message);
      }
    }
    loadFilters();
  }, []);

  // Load trend data
  useEffect(() => {
    if (!selectedCountry || !selectedIndicator) return;
    setLoading(true);
    setError(null);

    getIndicatorData(selectedIndicator, selectedCountry)
      .then((rows) => {
        const cleanedData = rows
          .filter(
            (row) =>
              row.NumericValue && (!row.Dim1 || row.Dim1 === "BTSX")
          )
          .sort((a, b) => Number(a.TimeDim) - Number(b.TimeDim))
          .map((row) => ({
            year: row.TimeDim,
            value: Number(row.NumericValue),
          }));
        setTrendData(cleanedData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCountry, selectedIndicator]);

  if (loading && trendData.length === 0) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const values = trendData.map((d) => d.value);
  const currentValue = values.at(-1) || 0;
  const highestValue = values.length > 0 ? Math.max(...values) : 0;
  const lowestValue = values.length > 0 ? Math.min(...values) : 0;

  return (
    <div className="trends-page">
      <TrendsHero />

      {/* Filters */}
      <div className="trends-filters">
        <div className="filter-card">
          <label className="filter-label">🌍 Select Country</label>
          <select
            className="filter-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((country) => (
              <option key={country.Code} value={country.Code}>
                {country.Title}
              </option>
            ))}
          </select>
          <small className="filter-help">
            Choose a country to explore health trends.
          </small>
        </div>

        <div className="filter-card">
          <label className="filter-label">📊 Select Indicator</label>
          <select
            className="filter-select"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
          >
            {indicators.map((indicator) => (
              <option
                key={indicator.IndicatorCode}
                value={indicator.IndicatorCode}
              >
                {indicator.IndicatorName}
              </option>
            ))}
          </select>
          <small className="filter-help">
            Choose a WHO indicator to visualize.
          </small>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="trend-stats">
        <div className="stat-card stat-card-animate">
          <h3 className="stat-label">Current</h3>
          <p className="stat-value">{currentValue}</p>
        </div>
        <div className="stat-card stat-card-animate">
          <h3 className="stat-label">Highest</h3>
          <p className="stat-value">{highestValue}</p>
        </div>
        <div className="stat-card stat-card-animate">
          <h3 className="stat-label">Lowest</h3>
          <p className="stat-value">{lowestValue}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-card">
        <h2 className="filter-label mb-4">Trend Over Time</h2>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      {trendData.length > 1 && (
        <div className="trend-insight filter-card mt-8">
          <h3 className="filter-label">Insight</h3>
          <p>
            The indicator changed from{" "}
            <strong>{trendData[0].value}</strong> to{" "}
            <strong>{trendData[trendData.length - 1].value}</strong> between{" "}
            {trendData[0].year} and {trendData[trendData.length - 1].year}.
          </p>
        </div>
      )}
    </div>
  );
}

export default Trends;
