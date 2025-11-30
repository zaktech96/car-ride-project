// Google Maps Location Service for Saudi Arabia
// Handles Places API, Geocoding, and Distance calculations

export interface LocationSuggestion {
  address: string;
  placeId: string;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
}

export interface RouteData {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  status: string;
}

export interface LocationFactors {
  isAirport: boolean;
  cityMultiplier: number;
  airportSurcharge: number;
  areaType: 'city' | 'suburb' | 'airport' | 'highway';
  city: string;
  region: string;
}

class LocationService {
  private apiKey: string;
  private isLoaded: boolean = false;
  private useGoogleMaps: boolean = false; // TODO: Set to true when you add your API key

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    // TODO: Uncomment this line when you add your Google Maps API key
    // this.useGoogleMaps = !!this.apiKey;
    
    if (!this.apiKey) {
      console.info('🗺️ Using hardcoded locations for development. Add VITE_GOOGLE_MAPS_API_KEY to use Google Maps.');
    }
  }

  // Load Google Maps JavaScript API
  private async loadGoogleMapsAPI(): Promise<void> {
    if (this.isLoaded || typeof window === 'undefined') return;
    
    if ((window as any).google?.maps) {
      this.isLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Global callback
      (window as any).initGoogleMaps = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Search locations using Google Places Autocomplete (or fallback)
  async searchLocations(query: string, countryCode: string = 'SA'): Promise<LocationSuggestion[]> {
    // For now, always use fallback suggestions for development
    // TODO: When you add Google Maps API key, change this to check this.useGoogleMaps
    if (!this.useGoogleMaps || query.length < 2) {
      return this.getFallbackSuggestions(query);
    }

    try {
      await this.loadGoogleMapsAPI();
      
      return new Promise((resolve) => {
        const service = new (window as any).google.maps.places.AutocompleteService();
        
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: countryCode },
          types: ['geocode', 'establishment'], // Include addresses and places
        }, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map(prediction => ({
              address: prediction.description,
              placeId: prediction.place_id,
              city: this.extractCity(prediction.terms),
              region: this.extractRegion(prediction.terms),
              country: 'Saudi Arabia',
              coordinates: { lat: 0, lng: 0 }, // Will be filled by getLocationDetails
              types: prediction.types || [],
            }));
            resolve(suggestions);
          } else {
            console.warn('Places API error:', status);
            resolve(this.getFallbackSuggestions(query));
          }
        });
      });
    } catch (error) {
      console.error('Location search error:', error);
      return this.getFallbackSuggestions(query);
    }
  }

  // Get detailed location information including coordinates
  async getLocationDetails(placeId: string): Promise<LocationSuggestion | null> {
    if (!this.apiKey || !placeId) return null;

    try {
      await this.loadGoogleMapsAPI();
      
      return new Promise((resolve) => {
        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        );
        
        service.getDetails({
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry', 'address_components', 'types'],
        }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location: LocationSuggestion = {
              address: place.formatted_address || place.name || '',
              placeId: placeId,
              city: this.extractCityFromComponents(place.address_components || []),
              region: this.extractRegionFromComponents(place.address_components || []),
              country: 'Saudi Arabia',
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              types: place.types || [],
            };
            resolve(location);
          } else {
            console.warn('Place details error:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Location details error:', error);
      return null;
    }
  }

  // Calculate route using Distance Matrix API (or fallback)
  async calculateRoute(origin: LocationSuggestion, destination: LocationSuggestion): Promise<RouteData | null> {
    // For now, always use fallback calculations for development
    // TODO: When you add Google Maps API key, change this to check this.useGoogleMaps
    if (!this.useGoogleMaps) {
      return this.getFallbackRoute(origin.address, destination.address);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin.address)}&destinations=${encodeURIComponent(destination.address)}&units=metric&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance,
          duration: element.duration,
          status: 'OK',
        };
      } else {
        console.warn('Distance Matrix API error:', data);
        return this.getFallbackRoute(origin.address, destination.address);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      return this.getFallbackRoute(origin.address, destination.address);
    }
  }

  // Analyze location for pricing factors
  getLocationFactors(location: LocationSuggestion): LocationFactors {
    const address = location.address.toLowerCase();
    const types = location.types || [];
    const city = location.city.toLowerCase();

    // Check if it's an airport
    const isAirport = types.includes('airport') || 
                     address.includes('airport') ||
                     address.includes('مطار');

    // City multipliers based on demand and cost of living
    const cityMultipliers: Record<string, number> = {
      'riyadh': 1.0,     // Base rate
      'jeddah': 1.1,     // 10% higher
      'mecca': 1.2,      // 20% higher (high demand)
      'medina': 1.1,     // 10% higher
      'dammam': 1.0,     // Same as Riyadh
      'khobar': 1.0,     // Same as Riyadh
      'dhahran': 1.0,    // Same as Riyadh
      'taif': 0.9,       // 10% lower
      'abha': 0.8,       // 20% lower
    };

    // Airport surcharges
    const airportSurcharge = isAirport ? 15 : 0; // 15 SAR for airport pickups

    // Determine area type
    let areaType: 'city' | 'suburb' | 'airport' | 'highway' = 'city';
    if (isAirport) {
      areaType = 'airport';
    } else if (address.includes('highway') || address.includes('طريق')) {
      areaType = 'highway';
    } else if (types.includes('sublocality') || address.includes('suburb')) {
      areaType = 'suburb';
    }

    return {
      isAirport,
      cityMultiplier: cityMultipliers[city] || 1.0,
      airportSurcharge,
      areaType,
      city: location.city,
      region: location.region,
    };
  }

  // Fallback suggestions for development/testing
  private getFallbackSuggestions(query: string): LocationSuggestion[] {
    const saudiLocations = [
      // Airports
      { name: 'King Khalid International Airport', city: 'Riyadh', types: ['airport'], coordinates: { lat: 24.9576, lng: 46.6988 } },
      { name: 'King Abdulaziz International Airport', city: 'Jeddah', types: ['airport'], coordinates: { lat: 21.6796, lng: 39.1565 } },
      { name: 'King Fahd International Airport', city: 'Dammam', types: ['airport'], coordinates: { lat: 26.4711, lng: 49.7979 } },
      { name: 'Prince Mohammed bin Abdulaziz Airport', city: 'Medina', types: ['airport'], coordinates: { lat: 24.5534, lng: 39.7051 } },
      { name: 'Taif Regional Airport', city: 'Taif', types: ['airport'], coordinates: { lat: 21.4827, lng: 40.5444 } },
      
      // Riyadh locations
      { name: 'Riyadh City Center', city: 'Riyadh', types: ['establishment'], coordinates: { lat: 24.7136, lng: 46.6753 } },
      { name: 'King Fahd Road', city: 'Riyadh', types: ['route'], coordinates: { lat: 24.7411, lng: 46.6544 } },
      { name: 'Olaya District', city: 'Riyadh', types: ['sublocality'], coordinates: { lat: 24.6877, lng: 46.6859 } },
      { name: 'Al Malaz', city: 'Riyadh', types: ['sublocality'], coordinates: { lat: 24.6408, lng: 46.7152 } },
      { name: 'Diplomatic Quarter', city: 'Riyadh', types: ['sublocality'], coordinates: { lat: 24.6918, lng: 46.6098 } },
      { name: 'King Abdulaziz Historical Center', city: 'Riyadh', types: ['establishment'], coordinates: { lat: 24.6465, lng: 46.7173 } },
      
      // Jeddah locations
      { name: 'Jeddah Corniche', city: 'Jeddah', types: ['establishment'], coordinates: { lat: 21.5169, lng: 39.1748 } },
      { name: 'Al Balad (Old Town)', city: 'Jeddah', types: ['establishment'], coordinates: { lat: 21.4858, lng: 39.1925 } },
      { name: 'Red Sea Mall', city: 'Jeddah', types: ['establishment'], coordinates: { lat: 21.6063, lng: 39.1034 } },
      { name: 'King Abdulaziz University', city: 'Jeddah', types: ['establishment'], coordinates: { lat: 21.5092, lng: 39.2441 } },
      
      // Mecca locations
      { name: 'Masjid al-Haram (Grand Mosque)', city: 'Mecca', types: ['establishment'], coordinates: { lat: 21.4225, lng: 39.8262 } },
      { name: 'Abraj Al Bait (Clock Tower)', city: 'Mecca', types: ['establishment'], coordinates: { lat: 21.4186, lng: 39.8256 } },
      { name: 'Mina', city: 'Mecca', types: ['sublocality'], coordinates: { lat: 21.4067, lng: 39.8847 } },
      { name: 'Arafat', city: 'Mecca', types: ['sublocality'], coordinates: { lat: 21.3544, lng: 39.9855 } },
      
      // Medina locations
      { name: 'Masjid an-Nabawi (Prophet\'s Mosque)', city: 'Medina', types: ['establishment'], coordinates: { lat: 24.4672, lng: 39.6117 } },
      { name: 'Quba Mosque', city: 'Medina', types: ['establishment'], coordinates: { lat: 24.4394, lng: 39.6194 } },
      { name: 'Mount Uhud', city: 'Medina', types: ['natural_feature'], coordinates: { lat: 24.4951, lng: 39.5951 } },
      
      // Eastern Province
      { name: 'Dammam Corniche', city: 'Dammam', types: ['establishment'], coordinates: { lat: 26.4207, lng: 50.0888 } },
      { name: 'Al Khobar Corniche', city: 'Al Khobar', types: ['establishment'], coordinates: { lat: 26.2172, lng: 50.1971 } },
      { name: 'Dhahran', city: 'Dhahran', types: ['locality'], coordinates: { lat: 26.2361, lng: 50.1328 } },
      { name: 'Half Moon Bay', city: 'Al Khobar', types: ['natural_feature'], coordinates: { lat: 26.1264, lng: 50.1640 } },
      { name: 'Saudi Aramco', city: 'Dhahran', types: ['establishment'], coordinates: { lat: 26.2361, lng: 50.1328 } },
      
      // Other major cities
      { name: 'Taif City Center', city: 'Taif', types: ['establishment'], coordinates: { lat: 21.2703, lng: 40.4158 } },
      { name: 'Abha City Center', city: 'Abha', types: ['establishment'], coordinates: { lat: 18.2465, lng: 42.5056 } },
      { name: 'Tabuk City Center', city: 'Tabuk', types: ['establishment'], coordinates: { lat: 28.3998, lng: 36.5700 } },
      { name: 'Hail City Center', city: 'Hail', types: ['establishment'], coordinates: { lat: 27.5114, lng: 41.7208 } },
      { name: 'Najran City Center', city: 'Najran', types: ['establishment'], coordinates: { lat: 17.4924, lng: 44.1277 } },
      
      // Popular destinations
      { name: 'NEOM Bay', city: 'NEOM', types: ['establishment'], coordinates: { lat: 28.2636, lng: 34.7892 } },
      { name: 'Al-Ula Old Town', city: 'Al-Ula', types: ['establishment'], coordinates: { lat: 26.6083, lng: 37.9267 } },
      { name: 'Edge of the World (Jebel Fihrayn)', city: 'Riyadh', types: ['natural_feature'], coordinates: { lat: 25.0969, lng: 45.8372 } },
    ];

    const queryLower = query.toLowerCase();
    return saudiLocations
      .filter(location => 
        location.name.toLowerCase().includes(queryLower) ||
        location.city.toLowerCase().includes(queryLower)
      )
      .slice(0, 8) // Limit to 8 suggestions for better UX
      .map(location => ({
        address: `${location.name}, ${location.city}, Saudi Arabia`,
        placeId: `fallback_${location.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
        city: location.city,
        region: this.getCityRegion(location.city),
        country: 'Saudi Arabia',
        coordinates: location.coordinates,
        types: location.types,
      }));
  }

  // Fallback route calculation using coordinates or pre-defined distances
  private getFallbackRoute(origin: string, destination: string): RouteData {
    // Try to calculate distance using coordinates if available
    const originCoords = this.getCoordinatesFromAddress(origin);
    const destCoords = this.getCoordinatesFromAddress(destination);
    
    let distance: number;
    
    if (originCoords && destCoords) {
      // Calculate actual distance using Haversine formula
      distance = this.calculateHaversineDistance(originCoords, destCoords);
    } else {
      // Fallback to pre-defined distances
      distance = this.estimateDistance(origin, destination);
    }
    
    const duration = this.estimateDuration(distance);

    // Format duration display for better readability
    const formatDuration = (minutes: number): string => {
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
          return `${hours} hr${hours > 1 ? 's' : ''}`;
        } else {
          return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
        }
      }
      return `${Math.round(duration)} min`;
    };

    return {
      distance: {
        text: `${Math.round(distance)} km`,
        value: Math.round(distance * 1000), // Convert to meters
      },
      duration: {
        text: formatDuration(Math.round(duration)),
        value: Math.round(duration * 60), // Convert to seconds
      },
      status: 'OK',
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateHaversineDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Convert degrees to radians
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Extract coordinates from address string (for fallback locations)
  private getCoordinatesFromAddress(address: string): { lat: number; lng: number } | null {
    const addressLower = address.toLowerCase();
    
    // Check if it's one of our known locations
    const knownLocations = [
      { keywords: ['king khalid international airport', 'riyadh airport'], coords: { lat: 24.9576, lng: 46.6988 } },
      { keywords: ['king abdulaziz international airport', 'jeddah airport'], coords: { lat: 21.6796, lng: 39.1565 } },
      { keywords: ['king fahd international airport', 'dammam airport'], coords: { lat: 26.4711, lng: 49.7979 } },
      { keywords: ['riyadh city center', 'riyadh downtown'], coords: { lat: 24.7136, lng: 46.6753 } },
      { keywords: ['jeddah corniche', 'jeddah waterfront'], coords: { lat: 21.5169, lng: 39.1748 } },
      { keywords: ['masjid al-haram', 'grand mosque', 'mecca'], coords: { lat: 21.4225, lng: 39.8262 } },
      { keywords: ['masjid an-nabawi', 'prophet mosque', 'medina'], coords: { lat: 24.4672, lng: 39.6117 } },
      { keywords: ['dammam corniche'], coords: { lat: 26.4207, lng: 50.0888 } },
      { keywords: ['al khobar corniche'], coords: { lat: 26.2172, lng: 50.1971 } },
    ];

    for (const location of knownLocations) {
      if (location.keywords.some(keyword => addressLower.includes(keyword))) {
        return location.coords;
      }
    }

    // Fallback to city centers
    if (addressLower.includes('riyadh')) return { lat: 24.7136, lng: 46.6753 };
    if (addressLower.includes('jeddah')) return { lat: 21.4858, lng: 39.1925 };
    if (addressLower.includes('mecca')) return { lat: 21.3891, lng: 39.8579 };
    if (addressLower.includes('medina')) return { lat: 24.5247, lng: 39.5692 };
    if (addressLower.includes('dammam')) return { lat: 26.4207, lng: 50.0888 };
    if (addressLower.includes('khobar')) return { lat: 26.2172, lng: 50.1971 };
    if (addressLower.includes('dhahran')) return { lat: 26.2361, lng: 50.1328 };
    if (addressLower.includes('taif')) return { lat: 21.2703, lng: 40.4158 };
    if (addressLower.includes('abha')) return { lat: 18.2465, lng: 42.5056 };

    return null;
  }

  // Estimate distance using fallback data (from your existing code)
  private estimateDistance(origin: string, destination: string): number {
    const originLower = origin.toLowerCase();
    const destLower = destination.toLowerCase();

    const cityDistances: Record<string, Record<string, number>> = {
      riyadh: {
        jeddah: 850, dammam: 400, mecca: 870, medina: 800, taif: 800,
        khobar: 420, dhahran: 420, 'al khobar': 420, airport: 35,
        'king khalid international airport': 35,
      },
      jeddah: {
        riyadh: 850, mecca: 80, medina: 350, taif: 200, dammam: 1200,
        airport: 20, 'king abdulaziz international airport': 20,
      },
      dammam: {
        riyadh: 400, jeddah: 1200, khobar: 15, 'al khobar': 15,
        dhahran: 10, airport: 25, 'king fahd international airport': 25,
      },
      mecca: { jeddah: 80, riyadh: 870, medina: 450, taif: 120 },
      medina: {
        riyadh: 800, jeddah: 350, mecca: 450, airport: 20,
        'prince mohammed bin abdulaziz airport': 20,
      },
    };

    for (const [city1, distances] of Object.entries(cityDistances)) {
      if (originLower.includes(city1)) {
        for (const [city2, distance] of Object.entries(distances)) {
          if (destLower.includes(city2)) {
            return distance;
          }
        }
      }
    }

    // Default fallback
    if (originLower.includes('airport') || destLower.includes('airport')) {
      return 50;
    }
    return 200;
  }

  // Estimate duration based on distance (rounded up to nearest hour)
  private estimateDuration(distance: number): number {
    const avgSpeed = distance > 100 ? 80 : 40; // km/h
    const durationMinutes = (distance / avgSpeed) * 60;
    
    // Round up to the nearest hour for better user experience
    const durationHours = Math.ceil(durationMinutes / 60);
    return durationHours * 60; // Convert back to minutes for consistency
  }

  // Helper methods for parsing Google Places API responses
  private extractCity(terms: google.maps.places.PredictionTerm[]): string {
    // Usually the second-to-last term is the city
    return terms.length > 1 ? terms[terms.length - 2].value : '';
  }

  private extractRegion(terms: google.maps.places.PredictionTerm[]): string {
    // Last term is usually the country, second-to-last might be region
    return terms.length > 2 ? terms[terms.length - 3].value : '';
  }

  private extractCityFromComponents(components: google.maps.GeocoderAddressComponent[]): string {
    const cityComponent = components.find(component => 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_1')
    );
    return cityComponent?.long_name || '';
  }

  private extractRegionFromComponents(components: Array<{ types: string[]; long_name: string; short_name: string }>): string {
    const regionComponent = components.find(component => 
      component.types.includes('administrative_area_level_1')
    );
    return regionComponent?.long_name || '';
  }

  private getCityRegion(city: string): string {
    const cityRegions: Record<string, string> = {
      'Riyadh': 'Riyadh Province',
      'Jeddah': 'Makkah Province',
      'Mecca': 'Makkah Province',
      'Medina': 'Medina Province',
      'Dammam': 'Eastern Province',
      'Al Khobar': 'Eastern Province',
      'Dhahran': 'Eastern Province',
      'Taif': 'Makkah Province',
      'Abha': 'Asir Province',
      'Tabuk': 'Tabuk Province',
      'Hail': 'Hail Province',
      'Najran': 'Najran Province',
      'NEOM': 'Tabuk Province',
      'Al-Ula': 'Medina Province',
    };
    return cityRegions[city] || 'Saudi Arabia';
  }

  private getCityCoordinates(city: string): { lat: number; lng: number } {
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'Riyadh': { lat: 24.7136, lng: 46.6753 },
      'Jeddah': { lat: 21.4858, lng: 39.1925 },
      'Mecca': { lat: 21.3891, lng: 39.8579 },
      'Medina': { lat: 24.5247, lng: 39.5692 },
      'Dammam': { lat: 26.4207, lng: 50.0888 },
      'Al Khobar': { lat: 26.2172, lng: 50.1971 },
      'Dhahran': { lat: 26.2361, lng: 50.1328 },
      'Taif': { lat: 21.2703, lng: 40.4158 },
      'Abha': { lat: 18.2465, lng: 42.5056 },
    };
    return cityCoordinates[city] || { lat: 24.7136, lng: 46.6753 }; // Default to Riyadh
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
