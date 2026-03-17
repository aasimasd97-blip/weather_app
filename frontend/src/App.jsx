import React, { useState } from "react"
import SearchBar from "./components/SearchBar"
import WeatherCard from "./components/WeatherCard"
import MapView from "./components/MapView"

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export default function App() {

  const [weather, setWeather] = useState(null)

  // units: 'metric' for Celsius, 'imperial' for Fahrenheit
  const [units, setUnits] = useState('metric')

  const [background, setBackground] = useState("/world.jpg")
  const [isVideo, setIsVideo] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (city, unitsParam) => {

    const unitsToUse = unitsParam || units

    setLoading(true)
    setError(null)

    try {

      const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}&units=${unitsToUse}`)
      const data = await res.json()

      setWeather(data)

      const condition = data.condition.toLowerCase()

      if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes(" shower")||
        condition.includes("Light rain shower")
      ) {
        setBackground("/rainy.mp4")
        setIsVideo(true)
      }

      else if (
        condition.includes("cloud") ||
        condition.includes("overcast") ||
        condition.includes("mist") ||
        condition.includes("fog") ||
        condition.includes("haze")
      ) {
        setBackground("/cloudy.mp4")
        setIsVideo(true)
      }

      else {
        setBackground("/sunny.mp4")
        setIsVideo(true)
      }

    } catch (err) {
      setError("City not found")
    }

    setLoading(false)
  }

  const onToggleUnits = (newUnits) => {
    if (!newUnits || (newUnits !== 'metric' && newUnits !== 'imperial')) return
    // Update units state then re-fetch current city in selected units
    setUnits(newUnits)
    if (weather && weather.city) {
      search(weather.city, newUnits)
    }
  }

  return (

    <div className="app-container">

      {/* Image background before search */}
      {!isVideo && (
        <img src={background} className="video-bg" alt="background" />
      )}

      {/* Weather video background */}
      {isVideo && (
        <video key={background} autoPlay muted loop className="video-bg">
          <source src={background} type="video/mp4"/>
        </video>
      )}

      <div className="center-box">

        <SearchBar onSearch={search} />

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {weather && (
          <>
            <WeatherCard data={weather} units={units} onToggleUnits={onToggleUnits} />
            <MapView coords={weather.coords} city={weather.city} temp={weather.temperature} units={units} />
          </>
        )}

      </div>

    </div>
  )
}