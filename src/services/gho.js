const BASE_URL = "/api";
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const { value } = await res.json();
  return value;
}

export async function getIndicators() {
  const rows = await apiFetch("/Indicator");
  console.log("Indicators:", rows);
  return rows.map(({ IndicatorCode, IndicatorName }) => ({ IndicatorCode, IndicatorName }));
}

export async function getCountries() {
  const rows = await apiFetch("/DIMENSION/COUNTRY/DimensionValues");
  console.log("Countries:", rows);
  return rows
    .map(({ Code, Title }) => ({ Code, Title }))
    .sort((a, b) => a.Title.localeCompare(b.Title));
}

export async function getIndicatorData(code, countryCode) {
  const filter = countryCode ? `?$filter=SpatialDim eq '${countryCode}'` : "";
  return apiFetch(`/${code}${filter}`);
}
