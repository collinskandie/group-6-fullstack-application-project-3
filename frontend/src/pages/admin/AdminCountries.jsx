import { useEffect, useState } from "react";
import { getCountries, addCountry, deleteCountry } from "../../services/gho";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

function AdminCountries() {
  const [countries, setCountries] = useState([]);
  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !isoCode) return;

    if (isoCode.trim().length !== 3) {
      setFormError("ISO Code must be exactly 3 characters (e.g., KEN)");
      return;
    }

    addCountry({ name: name.trim(), iso_code: isoCode.trim().toUpperCase() })
      .then((country) => {
        setCountries([...countries, country]);
        setName("");
        setIsoCode("");
      })
      .catch((err) => setFormError(err.response?.data?.message || "Failed to save country"));
  };

  const handleDelete = (id) => {
    setFormError(null);
    deleteCountry(id)
      .then(() => setCountries(countries.filter((c) => c.id !== id)))
      .catch((err) => setFormError(err.response?.data?.message || "Failed to delete country"));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="filter-card" style={{ marginBottom: "1.5rem", maxWidth: "420px" }}>
        <h3 className="filter-label">Add Country</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="text"
            aria-label="Country name"
            placeholder="Country Name (e.g., Kenya)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="filter-select"
          />
          <input
            type="text"
            aria-label="ISO code"
            placeholder="3-Letter ISO Code (e.g., KEN)"
            value={isoCode}
            onChange={(e) => setIsoCode(e.target.value)}
            maxLength={3}
            className="filter-select"
          />
          <button type="submit" className="btn-primary">
            Save Country
          </button>
        </form>
        {formError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{formError}</p>}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ISO Code</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {countries.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.iso_code}</td>
              <td style={{ textAlign: "right" }}>
                <button onClick={() => handleDelete(c.id)} className="btn-danger">
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

export default AdminCountries;
