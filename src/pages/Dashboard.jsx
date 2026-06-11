import { useState, useEffect } from "react";
import { getIndicators, getCountries } from "../services/gho";
import Hero from "../components/Hero";

function Dashboard() {
  const [indicators, setIndicators] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchIndicators = async () => {
      const data = await getIndicators();
      console.log("Fetched indicators:", data);
      setIndicators(data);
    };

    const fetchCountries = async () => {
      const data = await getCountries();
      console.log("Fetched countries:", data);
      setCountries(data);
    };

    fetchIndicators();
    fetchCountries();
  }, []);

  return (
    <div>
      <Hero />
      <h1>Dashboard</h1>
      <p>Indicators: {indicators.length}</p>
      <p>Countries: {countries.length}</p>
    </div>

  )

}

export default Dashboard;