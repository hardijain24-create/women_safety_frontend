import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { alertApi } from '../api/services';
import { LiveLocationManager } from '../services/LocationTaskManager';


export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('Fetching location...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if we were already sharing on mount (e.g. app restarted)
  useEffect(() => {
    const checkStatus = async () => {
      const sharing = await LiveLocationManager.isCurrentlySharing();
      setIsSharing(sharing);
      if (sharing) {
        const mins = await LiveLocationManager.getRemainingMinutes();
        setRemainingMinutes(mins);
        startCountdownTimer();
      }
    };
    checkStatus();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdownTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      const sharing = await LiveLocationManager.isCurrentlySharing();
      if (!sharing) {
        setIsSharing(false);
        setRemainingMinutes(0);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const mins = await LiveLocationManager.getRemainingMinutes();
      setRemainingMinutes(mins);
    }, 30000); // update every 30 seconds
  };

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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const osmResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${currentLoc.coords.latitude}&lon=${currentLoc.coords.longitude}&format=json&accept-language=en`,
            {
              headers: {
                'User-Agent': 'WomenSafetyApp/1.0',
              },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);
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
    // First, push the initial coordinate to the backend as a location_share alert
    const loc = await fetchLocation();
    if (!loc) throw new Error('Could not retrieve current GPS coordinates.');

    try {
      await alertApi.triggerAlert({
        user_id: userId,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        alert_type: 'location_share',
      });
    } catch (e: any) {
      console.warn('[useLocation] Initial alert trigger failed:', e);
    }

    // Start 1-hour background live tracking
    const started = await LiveLocationManager.startSharing(userId);
    if (!started) {
      throw new Error('Background location permission is required for live sharing.');
    }

    setIsSharing(true);
    const mins = await LiveLocationManager.getRemainingMinutes();
    setRemainingMinutes(mins);
    startCountdownTimer();
  };

  const stopSharing = async () => {
    await LiveLocationManager.stopSharing();
    setIsSharing(false);
    setRemainingMinutes(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    location,
    address,
    error,
    loading,
    isSharing,
    remainingMinutes,
    fetchLocation,
    shareLocation,
    stopSharing,
  };
};
