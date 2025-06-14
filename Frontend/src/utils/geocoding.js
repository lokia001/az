// src/utils/geocoding.js

/**
 * Geocodes an address string to latitude and longitude using Nominatim (OpenStreetMap).
 * @param {string} address The address string to geocode.
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if not found/error.
 */
export const geocodeAddress = async (address) => {
    if (!address || !address.trim()) {
        console.warn('[geocodeAddress] Address is empty.');
        return null;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.trim())}&limit=1`;
    console.log('[geocodeAddress] Requesting Nominatim URL:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            console.error(`[geocodeAddress] Nominatim API error! Status: ${response.status}`);
            return null;
        }
        const data = await response.json();
        console.log('[geocodeAddress] Nominatim response data:', data);

        if (data && data.length > 0) {
            const { lat, lon } = data[0]; // Nominatim uses 'lon' for longitude
            if (lat && lon) {
                return { lat: parseFloat(lat), lng: parseFloat(lon) };
            }
        }
        console.warn('[geocodeAddress] No results found for address:', address);
        return null;
    } catch (error) {
        console.error("[geocodeAddress] Error during Nominatim fetch:", error);
        return null;
    }
};