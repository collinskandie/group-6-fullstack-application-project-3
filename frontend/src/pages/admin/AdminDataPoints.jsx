import { useEffect, useState } from "react";
import { getCountries, getIndicators, getDataPoints, addDataPoint, deleteDataPoint } from "../../services/gho";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

function AdminDataPoints() {
  const [dataPoints, setDataPoints] = useState([]);
  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const [countryId, setCountryId] = useState("");
  const [indicatorId, setIndicatorId] = useState("");
  const [year, setYear] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    Promise.all([getDataPoints(), getCountries(), getIndicators()])
      .then(([dp, c, i]) => {
        setDataPoints(dp);
        setCountries(c);
        setIndicators(i);
        if (c.length > 0) setCountryId(String(c[0].id));
        if (i.length > 0) setIndicatorId(String(i[0].id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!countryId || !indicatorId || !year || !value) return;

    addDataPoint({
      country_id: Number(countryId),
      indicator_id: Number(indicatorId),
      year: Number(year),
      value: Number(value),
    })
      .then((dp) => {
        setDataPoints([...dataPoints, dp]);
        setYear("");
        setValue("");
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to save data point"));
  };

  const handleDelete = (id) => {
    setFormError(null);
    deleteDataPoint(id)
      .then(() => setDataPoints(dataPoints.filter((dp) => dp.id !== id)))
      .catch((err) => setFormError(err.response?.data?.message || "Failed to delete data point"));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="filter-card" style={{ marginBottom: "1.5rem", maxWidth: "480px" }}>
        <h3 className="filter-label">Add Data Point</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <select className="filter-select" aria-label="Country" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.Title}</option>
            ))}
          </select>
          <select className="filter-select" aria-label="Indicator" value={indicatorId} onChange={(e) => setIndicatorId(e.target.value)}>
            {indicators.map((i) => (
              <option key={i.id} value={i.id}>{i.IndicatorName}</option>
            ))}
          </select>
          <input
            type="number"
            aria-label="Year"
            placeholder="Year (e.g., 2022)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="filter-select"
          />
          <input
            type="number"
            step="any"
            aria-label="Value"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="filter-select"
          />
          <button type="submit" className="btn-primary">
            Save Data Point
          </button>
        </form>
        {formError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Indicator</th>
            <th>Year</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dataPoints.map((dp) => (
            <tr key={dp.id}>
              <td>{dp.country_name}</td>
              <td>{dp.indicator_name}</td>
              <td>{dp.year}</td>
              <td>{dp.value}</td>
              <td style={{ textAlign: "right" }}>
                <button onClick={() => handleDelete(dp.id)} className="btn-danger">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDataPoints;
