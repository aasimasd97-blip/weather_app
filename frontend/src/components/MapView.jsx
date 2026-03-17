import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon (works with many bundlers)
import markerUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerUrl,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 10, { duration: 1.2 })
    }
  }, [coords])
  return null
}

export default function MapView({ coords, city, temp, units }) {
  const center = coords ? [coords.lat, coords.lon] : [20, 0]
  // local state to switch between 'streets' and 'satellite' basemaps
  const [style, setStyle] = useState('streets')
  // radius in meters for the highlight circle; default to 5km
  const radiusMeters = 20000

  return (
    <div className="map-card">
      <div style={{ position: 'relative' }}>
        {/* small toggle buttons */}
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1000, background: 'rgba(255,255,255,0.85)', padding: 6, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          <button onClick={() => setStyle('streets')} style={{ marginRight: 6, padding: '6px 8px', background: style === 'streets' ? '#1976d2' : '#fff', color: style === 'streets' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: 4 }}>Streets</button>
          <button onClick={() => setStyle('satellite')} style={{ padding: '6px 8px', background: style === 'satellite' ? '#1976d2' : '#fff', color: style === 'satellite' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: 4 }}>Satellite</button>
        </div>

        <MapContainer center={center} zoom={10} style={{ height: 360, width: '100%' }}>
          {/* Choose basemap based on style */}
          {style === 'streets' ? (
            // Use ESRI World Street Map for English-only labels
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, Intermap, increment P, USGS, NPS, and the GIS User Community'
              />
              {/* Add English reference overlays for place names and transportation to ensure labels are English */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution='Labels &copy; Esri Reference Data'
                pane="overlayPane"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                attribution='Labels &copy; Esri Reference Data'
                pane="overlayPane"
              />
            </>
          ) : (
            // ESRI World Imagery (satellite) with English-only reference overlays
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
              />
              {/* English labels: boundaries/places and transportation overlays */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution='Labels &copy; Esri Reference Data'
                pane="overlayPane"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                attribution='Labels &copy; Esri Reference Data'
                pane="overlayPane"
              />
            </>
          )}

          {coords && (
            <>
              <Marker position={[coords.lat, coords.lon]}>
                <Popup>
                  <div>
                    <strong>{city}</strong>
                    <div>{Math.round(temp)} {units === 'metric' ? '°C' : '°F'}</div>
                  </div>
                </Popup>
              </Marker>
              {/* highlight the city with a circle */}
              <Circle center={[coords.lat, coords.lon]} radius={radiusMeters} pathOptions={{ color: '#1976d2', fillOpacity: 0.1 }} />
            </>
          )}

          <FlyTo coords={coords} />
        </MapContainer>
      </div>
    </div>
  )
}