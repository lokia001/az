// src/features/spaceSearch/components/InteractiveMap.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create instances of icons
const defaultMarkerIcon = new L.Icon.Default(); // Create an instance of the default icon

const geocodedLocationIcon = new L.Icon({ // Your custom red icon
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function ChangeMapView({ center, zoom }) {
    // ... (same as before)
    const map = useMap();
    useEffect(() => {
        if (center && typeof center.lat === 'number' && typeof center.lng === 'number' && typeof zoom === 'number') {
            map.setView([center.lat, center.lng], zoom);
        }
    }, [center, zoom, map]);
    return null;
}

const InteractiveMap = ({ center, zoom, markers, onMarkerClick }) => {
    // ... (prop validation and console logs same as before) ...
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
        return <div className="border bg-light text-center p-5">Dữ liệu vị trí không hợp lệ.</div>;
    }
    zoom = typeof zoom === 'number' ? zoom : 13;


    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%', minHeight: '400px', borderRadius: '0.25rem' }}
        >
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeMapView center={center} zoom={zoom} />

            {markers && markers.map((markerData, idx) => {
                if (markerData.lat == null || markerData.lng == null) {
                    return null;
                }
                const position = [markerData.lat, markerData.lng];
                const currentIcon = markerData.isGeocodedLocation ? geocodedLocationIcon : defaultMarkerIcon; // <--- MODIFIED HERE

                // Defensive check: Ensure currentIcon is a valid L.Icon instance
                if (!(currentIcon instanceof L.Icon)) {
                    console.error("Error: currentIcon is not a valid L.Icon instance for marker:", markerData.title, currentIcon);
                    // Fallback to a new default instance if something went wrong, though this shouldn't happen with the above.
                    // This is an extreme defensive measure.
                    // currentIcon = new L.Icon.Default();
                    return null; // Or skip rendering this marker if icon is truly broken
                }

                return (
                    <Marker
                        key={markerData.id || `marker-${idx}-${markerData.lat}-${markerData.lng}`}
                        position={position}
                        icon={currentIcon} // <--- Pass the explicit icon instance
                    >
                        <Popup>
                            <strong>{markerData.title || 'Vị trí'}</strong>
                            {markerData.isGeocodedLocation && <><br /><small>Vị trí bạn đã tìm kiếm.</small></>}
                            {/* ... other popup content ... */}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default InteractiveMap;