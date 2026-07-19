import { useState } from 'react';
import * as Location from 'expo-location';
import { alertApi } from '../api/services';


export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Fetching location...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to fetch and share coordinates.');
        setLoading(false);
        return null;
      }

      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLoc);

      try {
        let addressFound = false;

        // Try Nominatim (OpenStreetMap) first to force English localization
        try {
          const osmResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${currentLoc.coords.latitude}&lon=${currentLoc.coords.longitude}&format=json&accept-language=en`,
            {
              headers: {
                'User-Agent': 'WomenSafetyApp/1.0',
              },
            }
          );
          if (osmResponse.ok) {
            const osmData = await osmResponse.json();
            if (osmData && osmData.display_name) {
              setAddress(osmData.display_name);
              addressFound = true;
            }
          }
        } catch (osmErr) {
          console.warn('Nominatim reverse geocoding failed, falling back to native geocoder:', osmErr);
        }

        // Fallback to Expo native Geocoding (uses system locale) if Nominatim failed
        if (!addressFound) {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: currentLoc.coords.latitude,
            longitude: currentLoc.coords.longitude,
          });

          if (reverseGeocode.length > 0) {
            const addr = reverseGeocode[0];
            const formatted = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`.trim();
            setAddress(formatted || 'Unknown Address');
          } else {
            setAddress('Address not found');
          }
        }
      } catch (geocodeErr) {
        console.warn('Geocoding failed:', geocodeErr);
        setAddress('Coordinates retrieved, address lookups unavailable');
      }

      return currentLoc;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch location data. Ensure GPS is enabled.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const shareLocation = async (userId: string) => {
    const loc = await fetchLocation();
    if (!loc) throw new Error('Could not retrieve current GPS coordinates.');

    await alertApi.triggerAlert({
      user_id: userId,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      alert_type: 'location_share',
    });
    setIsSharing(true);
  };

  const stopSharing = () => {
    setIsSharing(false);
  };

  return {
    location,
    address,
    error,
    loading,
    isSharing,
    fetchLocation,
    shareLocation,
    stopSharing,
  };
};
