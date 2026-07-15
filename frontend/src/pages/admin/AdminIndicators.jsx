import { useEffect, useState } from "react";
import { getIndicators, addIndicator, deleteIndicator } from "../../services/gho";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

function AdminIndicators() {
  const [indicators, setIndicators] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    getIndicators()
      .then(setIndicators)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!code || !name) return;

    addIndicator({ code: code.trim(), name: name.trim(), unit: unit.trim() || undefined })
      .then((indicator) => {
        setIndicators([...indicators, indicator]);
        setCode("");
        setName("");
        setUnit("");
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to save indicator"));
  };

  const handleDelete = (id) => {
    setFormError(null);
    deleteIndicator(id)
      .then(() => setIndicators(indicators.filter((i) => i.id !== id)))
      .catch((err) => setFormError(err.response?.data?.message || "Failed to delete indicator"));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="filter-card" style={{ marginBottom: "1.5rem", maxWidth: "420px" }}>
        <h3 className="filter-label">Add Indicator</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="text"
            aria-label="WHO indicator code"
            placeholder="WHO Indicator Code (e.g., WHOSIS_000001)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="filter-select"
          />
          <input
            type="text"
            aria-label="Display name"
            placeholder="Display Name (e.g., Life Expectancy at Birth)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="filter-select"
          />
          <input
            type="text"
            aria-label="Unit (optional)"
            placeholder="Unit (optional, e.g., years)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="filter-select"
          />
          <button type="submit" className="btn-primary">
            Save Indicator
          </button>
        </form>
        {formError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Unit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((i) => (
            <tr key={i.id}>
              <td>{i.code}</td>
              <td>{i.name}</td>
              <td>{i.unit || "—"}</td>
              <td style={{ textAlign: "right" }}>
                <button onClick={() => handleDelete(i.id)} className="btn-danger">
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

export default AdminIndicators;
