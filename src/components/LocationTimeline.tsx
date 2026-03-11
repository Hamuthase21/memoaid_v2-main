import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Navigation, List, Map as MapIcon, Play, Square } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  time: string;
}

interface LocationCluster {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  placeType?: string;
  startTime: number;
  endTime: number;
  duration: number;
  pointCount: number;
  timeStart: string;
  timeEnd: string;
  accuracy?: number;
}

interface LocationDay {
  date: string;
  locations: LocationCluster[];
  allPoints: LocationPoint[];
}

const CLUSTERING_RADIUS_KM = 0.1;
const TRACKING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Map place types to corresponding icons
const getPlaceIcon = (placeType: string): string => {
  const iconMap: { [key: string]: string } = {
    // Home & Residential
    'house': '🏠',
    'residential': '🏠',
    'apartments': '🏢',

    // Food & Dining
    'restaurant': '🍽️',
    'cafe': '☕',
    'fast_food': '🍔',
    'bar': '🍺',
    'pub': '🍺',
    'food_court': '🍽️',

    // Shopping
    'shop': '🛒',
    'supermarket': '🛒',
    'mall': '🏬',
    'clothes': '👕',
    'convenience': '🏪',

    // Services
    'bank': '🏦',
    'atm': '💰',
    'post_office': '📮',
    'pharmacy': '💊',
    'hospital': '🏥',
    'clinic': '🏥',
    'dentist': '🦷',
    'hairdresser': '💇',
    'barber': '💈',
    'salon': '💇',

    // Transport
    'bus_station': '🚌',
    'train_station': '🚆',
    'airport': '✈️',
    'fuel': '⛽',
    'parking': '🅿️',

    // Education
    'school': '🏫',
    'university': '🎓',
    'college': '🎓',
    'library': '📚',

    // Entertainment
    'cinema': '🎬',
    'theatre': '🎭',
    'gym': '💪',
    'park': '🌳',
    'playground': '🎡',

    // Work
    'office': '🏢',
    'industrial': '🏭',
    'workplace': '💼',

    // Religion
    'place_of_worship': '🛐',
    'church': '⛪',
    'temple': '🛕',
    'mosque': '🕌',

    // Default
    'road': '🛣️',
    'street': '🛣️',
  };

  return iconMap[placeType.toLowerCase()] || '📍';
};

// Reverse geocoding using Nominatim (free, no API key needed)
const getPlaceInfo = async (lat: number, lon: number): Promise<{ name: string; type: string }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MemoAid Timeline App',
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const addr = data.address;

    // Build a street-level accurate name
    if (addr) {
      let placeName = '';
      let placeType = 'road';

      // Priority 1: Specific amenity or shop (most accurate)
      if (addr.amenity) {
        placeType = addr.amenity;
        const amenityName = data.name || addr.amenity.replace(/_/g, ' ');
        placeName = amenityName;
      } else if (addr.shop) {
        placeType = addr.shop;
        const shopName = data.name || addr.shop.replace(/_/g, ' ');
        placeName = shopName;
      }
      // Priority 2: Building with house number + road (street-level)
      else if (addr.road) {
        placeType = 'road';
        if (addr.house_number) {
          placeName = `${addr.house_number} ${addr.road}`;
        } else {
          placeName = addr.road;
        }
      }
      // Priority 3: Neighborhood/suburb
      else if (addr.suburb || addr.neighbourhood) {
        placeType = 'residential';
        placeName = addr.suburb || addr.neighbourhood;
      }
      // Priority 4: City/town
      else {
        placeType = 'residential';
        placeName = addr.village || addr.town || addr.city || 'Unknown Location';
      }

      return { name: placeName, type: placeType };
    }

    return { name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, type: 'unknown' };
  } catch (err) {
    console.error('Geocoding error:', err);
    return { name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`, type: 'unknown' };
  }
};

// Component to auto-fit map bounds
const MapBounds = ({ points }: { points: LocationPoint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
};

const LocationTimeline: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [locationData, setLocationData] = useState<LocationDay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showLocationOverride, setShowLocationOverride] = useState(false);
  const [overrideLat, setOverrideLat] = useState('11.6328');
  const [overrideLon, setOverrideLon] = useState('78.9629');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Auto-tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<string>('');
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Format date as YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Cluster nearby GPS points into locations
  const clusterLocations = async (points: LocationPoint[]): Promise<LocationCluster[]> => {
    if (points.length === 0) return [];

    const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
    const clusters: LocationCluster[] = [];
    let currentCluster: LocationPoint[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const lastPoint = currentCluster[currentCluster.length - 1];
      const distance = calculateDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        sorted[i].latitude,
        sorted[i].longitude
      );

      if (distance <= CLUSTERING_RADIUS_KM) {
        currentCluster.push(sorted[i]);
      } else {
        const avg = {
          lat: currentCluster.reduce((sum, p) => sum + p.latitude, 0) / currentCluster.length,
          lon: currentCluster.reduce((sum, p) => sum + p.longitude, 0) / currentCluster.length,
        };

        // Get place info via reverse geocoding
        const placeInfo = await getPlaceInfo(avg.lat, avg.lon);

        clusters.push({
          id: currentCluster[0].id,
          latitude: avg.lat,
          longitude: avg.lon,
          name: placeInfo.name,
          placeType: placeInfo.type,
          startTime: currentCluster[0].timestamp,
          endTime: currentCluster[currentCluster.length - 1].timestamp,
          duration: Math.round(
            (currentCluster[currentCluster.length - 1].timestamp - currentCluster[0].timestamp) / 60000
          ),
          pointCount: currentCluster.length,
          timeStart: new Date(currentCluster[0].timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timeEnd: new Date(
            currentCluster[currentCluster.length - 1].timestamp
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          accuracy: currentCluster.reduce((sum, p) => sum + (p.accuracy || 0), 0) / currentCluster.length,
        });

        currentCluster = [sorted[i]];
      }
    }

    // Add final cluster
    if (currentCluster.length > 0) {
      const avg = {
        lat: currentCluster.reduce((sum, p) => sum + p.latitude, 0) / currentCluster.length,
        lon: currentCluster.reduce((sum, p) => sum + p.longitude, 0) / currentCluster.length,
      };

      const placeInfo = await getPlaceInfo(avg.lat, avg.lon);

      clusters.push({
        id: currentCluster[0].id,
        latitude: avg.lat,
        longitude: avg.lon,
        name: placeInfo.name,
        placeType: placeInfo.type,
        startTime: currentCluster[0].timestamp,
        endTime: currentCluster[currentCluster.length - 1].timestamp,
        duration: Math.round(
          (currentCluster[currentCluster.length - 1].timestamp - currentCluster[0].timestamp) / 60000
        ),
        pointCount: currentCluster.length,
        timeStart: new Date(currentCluster[0].timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timeEnd: new Date(
          currentCluster[currentCluster.length - 1].timestamp
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        accuracy: currentCluster.reduce((sum, p) => sum + (p.accuracy || 0), 0) / currentCluster.length,
      });
    }

    return clusters;
  };

  // Capture current location and save to backend
  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setTrackingStatus('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          await api.journey.saveLocation(latitude, longitude, accuracy || 0);
          setTrackingStatus(`Saved: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

          // Refresh data if viewing today
          if (isToday()) {
            fetchLocationData();
          }
        } catch (err) {
          console.error('Error saving location:', err);
          setTrackingStatus('Error saving location');
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setTrackingStatus(`Error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Start location tracking
  const startTracking = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    // Request permission and capture first location
    try {
      setIsTracking(true);
      setTrackingStatus('Starting tracking...');

      // Capture immediately
      await captureLocation();

      // Set up periodic capture every 5 minutes
      trackingIntervalRef.current = setInterval(() => {
        captureLocation();
      }, TRACKING_INTERVAL_MS);

      setTrackingStatus('Tracking active');
    } catch (err) {
      console.error('Error starting tracking:', err);
      setIsTracking(false);
      setTrackingStatus('');
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    setIsTracking(false);
    setTrackingStatus('');

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Fetch location data for the selected date
  const fetchLocationData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const dateStr = formatDateForAPI(selectedDate);
      const data = await api.journey.getJourneyByDate(dateStr);

      console.log('📍 [RAW] Fetched location data from API:', data);

      if (data && Array.isArray(data)) {
        const points: LocationPoint[] = data.map((loc: any) => ({
          id: loc._id || loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          timestamp: new Date(loc.timestamp || loc.createdAt).getTime(),
          time: new Date(loc.timestamp || loc.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        const clusters = await clusterLocations(points);

        setLocationData({
          date: dateStr,
          locations: clusters,
          allPoints: points,
        });
      } else {
        setLocationData({
          date: dateStr,
          locations: [],
          allPoints: [],
        });
      }
    } catch (err) {
      console.error('❌ [LocationTimeline] Error fetching location data:', err);
      setError(`Error loading location timeline: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchLocationData();
    }
  }, [selectedDate]);

  const handlePreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (): boolean => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  };

  const isFuture = (): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  };

  const handleSaveLocationOverride = async () => {
    try {
      const lat = parseFloat(overrideLat);
      const lon = parseFloat(overrideLon);

      if (isNaN(lat) || isNaN(lon)) {
        alert('❌ Please enter valid numbers');
        return;
      }

      if (lat < -90 || lat > 90) {
        alert('❌ Latitude must be between -90 and 90');
        return;
      }

      if (lon < -180 || lon > 180) {
        alert('❌ Longitude must be between -180 and 180');
        return;
      }

      const confirmMsg = `📍 Saving Location:\nLatitude: ${lat.toFixed(4)}°\nLongitude: ${lon.toFixed(4)}°\n\nClick OK to confirm`;
      if (!confirm(confirmMsg)) {
        return;
      }

      console.log('📍 Saving override location:', { lat, lon });
      const result = await api.journey.saveLocation(lat, lon, 10);
      console.log('✅ Location saved successfully:', result);
      alert('✅ Location saved! Refreshing timeline...');
      setShowLocationOverride(false);

      // Refresh data
      fetchLocationData();
    } catch (err) {
      console.error('❌ Error saving override location:', err);
      alert('❌ Failed to save location: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const indianCities = [
    { name: 'Nallampalli (Approx)', lat: 11.6328, lon: 78.9629 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  ];

  const locations = locationData?.locations || [];
  const allPoints = locationData?.allPoints || [];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
      {/* Header: Date Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm p-4 sticky top-0 z-10 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                {formatDateForDisplay(selectedDate)}
              </h1>
              <p className="text-sm text-slate-500">
                {isToday() ? 'Today' : isFuture() ? 'Future' : 'Your Location Timeline'}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Tracking Toggle */}
              {isToday() && (
                <button
                  onClick={isTracking ? stopTracking : startTracking}
                  className={`p-2 rounded-lg transition ${isTracking
                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                  title={isTracking ? 'Stop tracking' : 'Start tracking'}
                >
                  {isTracking ? (
                    <Square className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>
              )}

              <button
                onClick={() => setShowLocationOverride(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
                title="Override location (for testing)"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
                title="Next day"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Tracking Status */}
          {isTracking && trackingStatus && (
            <div className="mb-2 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">{trackingStatus}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${viewMode === 'map'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
            </div>

            <button
              onClick={handleToday}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${isToday()
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center p-8 bg-white/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading location timeline...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && locations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/50">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-lg">No location data recorded for this day</p>
            <p className="text-sm text-slate-400 mt-2">
              {isToday() ? 'Click the Play button to start tracking' : 'Enable location tracking to see your movement history'}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && locations.length > 0 && (
          <div className="flex-1 flex relative">

            {/* Map View */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <MapContainer
                center={[locations[0].latitude, locations[0].longitude]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-fit bounds */}
                <MapBounds points={allPoints} />

                {/* Path Line */}
                {allPoints.length > 1 && (
                  <Polyline
                    positions={allPoints.map(p => [p.latitude, p.longitude])}
                    pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.6 }}
                  />
                )}

                {/* Individual GPS Points as small circles */}
                {allPoints.map((point, idx) => (
                  <CircleMarker
                    key={`point-${point.id || idx}`}
                    center={[point.latitude, point.longitude]}
                    radius={3}
                    pathOptions={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.6,
                      color: '#1d4ed8',
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <div className="font-semibold">{point.time}</div>
                        <div className="text-slate-500">
                          {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Stop Markers (clusters) */}
                {locations.map((loc, idx) => (
                  <Marker key={loc.id || idx} position={[loc.latitude, loc.longitude]}>
                    <Popup>
                      <div className="p-1">
                        <div className="font-bold text-slate-900 mb-1">{loc.name || 'Unknown Location'}</div>
                        <div className="text-xs text-slate-500 mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {loc.timeStart} - {loc.timeEnd}
                        </div>
                        <div className="text-xs text-slate-500">
                          ⏱️ {loc.duration} min duration
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* List View */}
            <div className={`absolute inset-0 z-10 bg-white overflow-y-auto transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="max-w-3xl mx-auto p-4">
                {/* Summary Card */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">Daily Summary</h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{locations.length}</span> Stops
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{allPoints.length}</span> GPS Points
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{locations[0].timeStart} - {locations[locations.length - 1].timeEnd}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Total Duration:</span>
                          <span className="font-medium">
                            {Math.round((locations[locations.length - 1].endTime - locations[0].startTime) / 60000)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {locations.map((location, idx) => (
                    <div key={location.id || idx} className="relative pl-8 pb-8 last:pb-0">
                      {idx < locations.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200"></div>
                      )}

                      <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-blue-500 rounded-full z-10 shadow-sm"></div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            {/* Place Icon */}
                            <div className="text-3xl mt-1 flex-shrink-0">
                              {getPlaceIcon(location.placeType || 'unknown')}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                {location.name || `Stop ${idx + 1}`}
                              </h3>
                              <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <div className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg self-start sm:self-auto">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div className="text-sm font-medium text-slate-700">
                              {location.timeStart}
                            </div>
                            <span className="text-slate-300">→</span>
                            <div className="text-sm font-medium text-slate-700">
                              {location.timeEnd}
                            </div>
                            <div className="text-xs text-slate-400 font-medium pl-2 border-l border-slate-200">
                              {location.duration}m
                            </div>
                          </div>
                        </div>

                        {idx > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                            <Navigation className="w-3 h-3" />
                            <span>
                              Traveled for {Math.round((location.startTime - locations[idx - 1].endTime) / 60000)} min from previous stop
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Override Modal */}
      {showLocationOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Test Location</h2>
            <p className="text-sm text-slate-600 mb-4">
              Select a city or enter coordinates manually:
            </p>

            <div className="mb-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Quick Select Cities:</p>
              {indianCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setOverrideLat(String(city.lat));
                    setOverrideLon(String(city.lon));
                  }}
                  className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition border border-blue-200"
                >
                  {city.name} ({city.lat.toFixed(4)}°, {city.lon.toFixed(4)}°)
                </button>
              ))}
            </div>

            <div className="mb-4 space-y-3 border-t pt-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Latitude (-90 to +90)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={overrideLat}
                  onChange={(e) => setOverrideLat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 11.6328"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Longitude (-180 to +180)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={overrideLon}
                  onChange={(e) => setOverrideLon(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 78.9629"
                />
              </div>

              {overrideLat && overrideLon && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-slate-600 mb-1">Preview:</p>
                  <p className="font-mono text-sm text-blue-700 font-semibold">
                    📍 {parseFloat(overrideLat).toFixed(4)}° N, {parseFloat(overrideLon).toFixed(4)}° E
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationOverride(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocationOverride}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Save & Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTimeline;
