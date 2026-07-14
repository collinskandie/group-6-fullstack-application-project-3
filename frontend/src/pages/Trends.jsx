import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "KEN");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countryError, setCountryError] = useState(false);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountryError(true));

    getIndicators()
      .then((data) => {
        setIndicators(data);
        if (data.length > 0) setSelectedIndicator(data[0].IndicatorCode);
      })
      .catch(() => setError("Could not load indicator list."));
  }, []);

  useEffect(() => {
    if (!selectedCountry || !selectedIndicator) return;
    setLoading(true);
    setError(null);

    getIndicatorData(selectedIndicator, selectedCountry)
      .then((rows) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        const cleaned = safeRows
          .filter((row) => {
            if (row.NumericValue == null) return false;
            if (!row.Dim1) return true;
            return row.Dim1 === "SEX_BTSX" || row.Dim1 === "BTSX";
          })
          .sort((a, b) => Number(a.TimeDim) - Number(b.TimeDim))
          .map((row) => ({
            year: row.TimeDim,
            value: Math.round(Number(row.NumericValue) * 10) / 10,
          }));
        setTrendData(cleaned);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCountry, selectedIndicator]);

  if (loading && trendData.length === 0) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const values = trendData.map((d) => d.value);
  const currentValue = values.at(-1) ?? "—";
  const highestValue = values.length > 0 ? Math.max(...values) : "—";
  const lowestValue  = values.length > 0 ? Math.min(...values) : "—";

  const selectedIndicatorName =
    indicators.find((i) => i.IndicatorCode === selectedIndicator)?.IndicatorName ?? "";

  const trend =
    trendData.length > 1
      ? values.at(-1) > values[0]
        ? "increased"
        : values.at(-1) < values[0]
        ? "decreased"
        : "stayed flat"
      : null;

  return (
    <main className="main-content">
      <TrendsHero />

      {countryError && (
        <p style={{ color: "#b45309", fontSize: "13px", padding: "0 0 12px" }}>
          Could not load country list. Using default selection.
        </p>
      )}

      {/* Filters */}
      <div className="trends-filters">
        <div className="filter-card">
          <label className="filter-label">🌍 Country</label>
          <select
            className="filter-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.Code} value={c.Code}>
                {c.Title}
              </option>
            ))}
          </select>
          <small className="filter-help">Choose a country to explore.</small>
        </div>

        <div className="filter-card">
          <label className="filter-label">📊 Indicator</label>
          <select
            className="filter-select"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
          >
            {indicators.map((ind) => (
              <option key={ind.IndicatorCode} value={ind.IndicatorCode}>
                {ind.IndicatorName}
              </option>
            ))}
          </select>
          <small className="filter-help">
            {indicators.length} curated WHO indicators.
          </small>
        </div>
      </div>

      {/* Summary cards */}
      <div className="trend-stats">
        {[
          { label: "Latest value", value: currentValue },
          { label: "Highest recorded", value: highestValue },
          { label: "Lowest recorded", value: lowestValue },
        ].map(({ label, value }) => (
          <div className="stat-card stat-card-animate" key={label}>
            <h3 className="stat-label">{label}</h3>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-card">
        <h2 className="filter-label" style={{ marginBottom: "1rem" }}>
          {selectedIndicatorName} — trend over time
        </h2>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
            Loading chart data…
          </div>
        )}

        {!loading && trendData.length === 0 && (
          <p style={{ color: "#6b7280", fontStyle: "italic", padding: "2rem 0" }}>
            No data available for this country and indicator combination.
          </p>
        )}

        {!loading && trendData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  fontSize: "0.85rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-primary)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight */}
      {trend && (
        <div className="filter-card" style={{ marginTop: "1.5rem" }}>
          <h3 className="filter-label">Insight</h3>
          <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <strong>{selectedIndicatorName}</strong> in{" "}
            <strong>{countries.find((c) => c.Code === selectedCountry)?.Title ?? selectedCountry}</strong>{" "}
            {trend} from{" "}
            <strong>{trendData[0].value}</strong> ({trendData[0].year}) to{" "}
            <strong>{trendData.at(-1).value}</strong> ({trendData.at(-1).year}).
          </p>
        </div>
      )}
    </main>
  );
}

export default Trends;
