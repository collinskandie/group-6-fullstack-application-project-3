import { useState, useEffect } from "react";
import { getCountries, getIndicatorData } from "../services/gho";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function Compare() {
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(["KEN", "UGA"]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectionWarning, setSelectionWarning] = useState(null);

  // Life expectancy at birth — hardcoded for Phase 1 scope
  const INDICATOR_CODE = "WHOSIS_000001";

  useEffect(() => {
    getCountries()
      .then((res) => setCountries(res))
      .catch((err) => console.log("Failed to load country list:", err));
  }, []);

  useEffect(() => {
    if (selectedCountries.length < 2) return;

    setIsLoading(true);
    setApiError(null);

    const fetchPromises = selectedCountries.map((code) =>
      getIndicatorData(INDICATOR_CODE, code)
        .then((dataRows) => {
          const rows = Array.isArray(dataRows) ? dataRows : [];

          // Prefer "both sexes" rows; fall back to all rows if none found
          const btsx = rows.filter(
            (row) => row.TimeDim && row.NumericValue != null && row.Dim1 === "BTSX"
          );
          const cleanRows = btsx.length > 0
            ? btsx
            : rows.filter((row) => row.TimeDim && row.NumericValue != null);

          if (cleanRows.length === 0) {
            return { code, year: "N/A", score: null, error: "No data available" };
          }

          const latestRecord = cleanRows.sort((x, y) => y.TimeDim - x.TimeDim)[0];
          const numericValue = typeof latestRecord.NumericValue === "number"
            ? latestRecord.NumericValue
            : parseFloat(latestRecord.NumericValue);

          return {
            code,
            year: latestRecord.TimeDim,
            score: parseFloat(numericValue.toFixed(1)),
            error: null,
          };
        })
        .catch(() => ({ code, year: "N/A", score: null, error: "Failed to load" }))
    );

    // allSettled so one country failure doesn't wipe out the rest
    Promise.allSettled(fetchPromises)
      .then((results) => {
        const finalDataset = results.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : { code: "unknown", year: "N/A", score: null, error: "Request failed" }
        );
        setChartData(finalDataset);
      })
      .catch((err) => setApiError(err.message || "Could not fetch comparison data"))
      .finally(() => setIsLoading(false));
  }, [selectedCountries]);

  const toggleCountrySelection = (code) => {
    const isAlreadySelected = selectedCountries.includes(code);

    if (isAlreadySelected) {
      if (selectedCountries.length <= 2) {
        setSelectionWarning("Please pick at least 2 countries to compare.");
        return;
      }
      setSelectionWarning(null);
      setSelectedCountries(selectedCountries.filter((item) => item !== code));
    } else {
      if (selectedCountries.length >= 4) {
        setSelectionWarning("Maximum limit is 4 countries.");
        return;
      }
      setSelectionWarning(null);
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  if (isLoading && chartData.length === 0) return <Loading />;
  if (apiError) return <ErrorMessage message={apiError} />;

  return (
    <main className="main-content">
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "8px" }}>Country Comparison Dashboard</h2>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Compare <strong>Life Expectancy at Birth</strong> side-by-side across 2 to 4 countries.
      </p>

      {/* Checklist Box */}
      <div style={{
        border: "1px solid #ccc",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "8px",
        maxHeight: "160px",
        overflowY: "auto",
        background: "#fafafa"
      }}>
        <b style={{ display: "block", marginBottom: "10px" }}>Select Countries to Compare:</b>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
          {countries.map((item) => (
            <label key={item.Code} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={selectedCountries.includes(item.Code)}
                onChange={() => toggleCountrySelection(item.Code)}
              />
              {item.Title || item.Code}
            </label>
          ))}
        </div>
      </div>

      {/* Inline selection warning (replaces alert()) */}
      {selectionWarning && (
        <p style={{ color: "#b45309", fontSize: "13px", marginBottom: "16px" }}>
          {selectionWarning}
        </p>
      )}

      {isLoading && <p style={{ color: "#888", fontStyle: "italic", marginBottom: "16px" }}>Refreshing chart data...</p>}

      {/* CSS Bar Chart */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {chartData.map((row) => {
          const match = countries.find((c) => c.Code === row.code);
          const name = match ? match.Title : row.code;
          const percentageWidth = row.score != null ? Math.min((row.score / 95) * 100, 100) : 0;

          return (
            <div key={row.code} style={{ display: "grid", gridTemplateColumns: "160px 1fr 70px", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </div>

              <div style={{ background: "#eaeaea", borderRadius: "2px", height: "20px", width: "100%" }}>
                {row.error ? (
                  <span style={{ fontSize: "12px", color: "#dc2626", paddingLeft: "8px", lineHeight: "20px", display: "block" }}>
                    {row.error}
                  </span>
                ) : (
                  <div style={{
                    width: `${percentageWidth}%`,
                    background: "#2563eb",
                    height: "100%",
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "8px",
                    boxSizing: "border-box",
                    transition: "width 0.4s ease-out"
                  }}>
                    {row.score != null && row.score > 0 && (
                      <span style={{ color: "#fff", fontSize: "11px", fontWeight: "600" }}>{row.score}</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ fontSize: "12px", color: "#777", textAlign: "right" }}>
                {row.error ? "—" : `Year: ${row.year}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </main>
  );
}

export default Compare;
