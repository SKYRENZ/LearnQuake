import axios from 'axios';

class USGSEarthquakeService {
  constructor() {
    this.baseURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';
    this.geoNamesURL = 'http://api.geonames.org/searchJSON';
    this.geoNamesUsername = 'demo'; // You should get your own username from geonames.org
    this.nominatimURL = 'https://nominatim.openstreetmap.org/search';
  }

  // Enhanced geocoding with multiple services
  async getCoordinatesFromPlace(placeName) {
    try {
      // Try OpenStreetMap Nominatim first (better for streets, neighborhoods, local places)
      const nominatimResult = await this.searchWithNominatim(placeName);
      if (nominatimResult) {
        console.log(`Found location via Nominatim: ${nominatimResult.name}`);
        return nominatimResult;
      }

      // Fallback to GeoNames
      const geoNamesResult = await this.searchWithGeoNames(placeName);
      if (geoNamesResult) {
        console.log(`Found location via GeoNames: ${geoNamesResult.name}`);
        return geoNamesResult;
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error.message);
      return null;
    }
  }

  // Search using OpenStreetMap Nominatim (better for local places)
  async searchWithNominatim(placeName) {
    try {
      const response = await axios.get(this.nominatimURL, {
        params: {
          q: placeName,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'LearnQuake-EarthquakeApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon),
          name: location.display_name.split(',')[0], // Get the main place name
          fullAddress: location.display_name,
          country: location.address?.country || 'Unknown',
          state: location.address?.state || location.address?.province || '',
          city: location.address?.city || location.address?.town || location.address?.village || '',
          type: location.type,
          importance: location.importance
        };
      }
      return null;
    } catch (error) {
      console.error('Nominatim search error:', error.message);
      return null;
    }
  }

  // Search using GeoNames (fallback)
  async searchWithGeoNames(placeName) {
    try {
      const response = await axios.get(this.geoNamesURL, {
        params: {
          q: placeName,
          maxRows: 1,
          username: this.geoNamesUsername,
          style: 'full'
        }
      });
      
      if (response.data.geonames && response.data.geonames.length > 0) {
        const location = response.data.geonames[0];
        return {
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lng),
          name: location.name,
          fullAddress: `${location.name}, ${location.adminName1 || ''}, ${location.countryName}`,
          country: location.countryName,
          state: location.adminName1 || '',
          city: location.name,
          type: 'geonames',
          importance: 0.5
        };
      }
      return null;
    } catch (error) {
      console.error('GeoNames search error:', error.message);
      return null;
    }
  }

  // Multi-strategy search for earthquakes
  async searchEarthquakesByLocation(searchQuery, radiusKm = 500, timeframe = 'month') {
    try {
      console.log(`🔍 Searching for earthquakes near: "${searchQuery}"`);
      
      // Strategy 1: Try geocoding the search query
      const coordinates = await this.getCoordinatesFromPlace(searchQuery);
      
      if (coordinates) {
        console.log(`📍 Found coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
        const result = await this.searchByCoordinates(coordinates, radiusKm, timeframe);
        return result;
      }

      // Strategy 2: Direct text search in earthquake place names
      console.log(`🔍 Geocoding failed, trying direct text search...`);
      const textSearchResult = await this.searchEarthquakesByPlaceName(searchQuery, timeframe);
      
      // Strategy 3: Try partial matching and common variations
      if (textSearchResult.earthquakes.length === 0) {
        console.log(`🔍 Direct search failed, trying partial matching...`);
        return await this.searchEarthquakesWithPartialMatch(searchQuery, timeframe);
      }

      return textSearchResult;
    } catch (error) {
      console.error('Error searching earthquakes by location:', error.message);
      throw error;
    }
  }

  // Search earthquakes by coordinates
  async searchByCoordinates(coordinates, radiusKm, timeframe) {
    const allEarthquakes = await this.fetchAllEarthquakes(timeframe);

    const nearbyEarthquakes = allEarthquakes.filter(earthquake => {
      const distance = this.calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        earthquake.latitude,
        earthquake.longitude
      );
      return distance <= radiusKm;
    });

    nearbyEarthquakes.sort((a, b) => b.magnitude - a.magnitude);

    return {
      searchLocation: coordinates,
      earthquakes: nearbyEarthquakes,
      totalFound: nearbyEarthquakes.length,
      searchMethod: 'coordinates'
    };
  }

  // Enhanced text search with partial matching
  async searchEarthquakesWithPartialMatch(searchQuery, timeframe = 'month') {
    try {
      const allEarthquakes = await this.fetchAllEarthquakes(timeframe);
      const queryLower = searchQuery.toLowerCase();
      
      // Create search variations
      const searchTerms = [
        queryLower,
        queryLower.replace(/\s+/g, ''), // Remove spaces
        ...queryLower.split(' '), // Individual words
        ...this.generateSearchVariations(queryLower)
      ];

      console.log(`🔍 Searching with terms: ${searchTerms.join(', ')}`);

      const matchedEarthquakes = allEarthquakes.filter(earthquake => {
        const placeLower = earthquake.place.toLowerCase();
        return searchTerms.some(term => 
          placeLower.includes(term) || 
          this.fuzzyMatch(placeLower, term)
        );
      });

      // Sort by relevance (exact matches first, then by magnitude)
      matchedEarthquakes.sort((a, b) => {
        const aExact = a.place.toLowerCase().includes(queryLower);
        const bExact = b.place.toLowerCase().includes(queryLower);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return b.magnitude - a.magnitude;
      });

      return {
        searchLocation: { 
          name: searchQuery,
          searchTerms: searchTerms 
        },
        earthquakes: matchedEarthquakes,
        totalFound: matchedEarthquakes.length,
        searchMethod: 'partial_match'
      };
    } catch (error) {
      console.error('Error in partial match search:', error.message);
      throw error;
    }
  }

  // Generate search variations for better matching
  generateSearchVariations(query) {
    const variations = [];
    
    // Common abbreviations and variations
    const replacements = {
      'street': 'st',
      'st': 'street',
      'avenue': 'ave',
      'ave': 'avenue',
      'boulevard': 'blvd',
      'blvd': 'boulevard',
      'road': 'rd',
      'rd': 'road',
      'drive': 'dr',
      'dr': 'drive',
      'california': 'ca',
      'ca': 'california',
      'new york': 'ny',
      'ny': 'new york',
      'san francisco': 'sf',
      'sf': 'san francisco',
      'los angeles': 'la',
      'la': 'los angeles'
    };

    Object.entries(replacements).forEach(([from, to]) => {
      if (query.includes(from)) {
        variations.push(query.replace(new RegExp(from, 'g'), to));
      }
    });

    return variations;
  }

  // Simple fuzzy matching
  fuzzyMatch(text, pattern) {
    if (pattern.length <= 2) return false; // Don't fuzzy match very short terms
    
    // Check if most characters of the pattern exist in the text
    let matches = 0;
    for (let char of pattern) {
      if (text.includes(char)) matches++;
    }
    
    return matches / pattern.length > 0.7; // 70% character match
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Fetch all earthquake data from USGS
  async fetchAllEarthquakes(timeframe = 'month') {
    try {
      const endpoint = `${this.baseURL}all_${timeframe}.geojson`;
      console.log(`Fetching earthquake data from: ${endpoint}`);
      
      const response = await axios.get(endpoint);
      const earthquakes = response.data.features;

      return earthquakes.map(earthquake => ({
        id: earthquake.id,
        magnitude: earthquake.properties.mag,
        place: earthquake.properties.place,
        time: new Date(earthquake.properties.time),
        depth: earthquake.geometry.coordinates[2],
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0],
        url: earthquake.properties.url,
        significance: earthquake.properties.sig,
        type: earthquake.properties.type
      }));
    } catch (error) {
      console.error('Error fetching earthquake data:', error.message);
      throw new Error('Failed to fetch earthquake data');
    }
  }

  // Search earthquakes by place name (improved)
  async searchEarthquakesByPlaceName(searchQuery, timeframe = 'month') {
    try {
      const allEarthquakes = await this.fetchAllEarthquakes(timeframe);
      
      const filteredEarthquakes = allEarthquakes.filter(earthquake => 
        earthquake.place.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort by magnitude (highest first)
      filteredEarthquakes.sort((a, b) => b.magnitude - a.magnitude);

      return {
        searchLocation: { name: searchQuery },
        earthquakes: filteredEarthquakes,
        totalFound: filteredEarthquakes.length,
        searchMethod: 'place_name'
      };
    } catch (error) {
      console.error('Error searching earthquakes by place name:', error.message);
      throw error;
    }
  }
}

export default USGSEarthquakeService;