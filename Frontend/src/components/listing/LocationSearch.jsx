import React, { useState, useEffect, useRef } from 'react';
import { IconMapPin, IconLoader, IconSearch, IconCurrentLocation } from '@tabler/icons-react';

const LocationSearch = ({
  searchQuery,
  setSearchQuery,
  handleSearchChange,
  handleSearchSubmit,
  handleSelectSuggestion,
  getCurrentLocation,
  suggestions,
  isSearching,
  isGettingLocation,
  showSuggestions,
  setShowSuggestions,
  address
}) => {
  const searchContainerRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <IconMapPin className="inline-block w-4 h-4 mr-1" />
        Search Location
      </label>
      <div className="location-search-container relative" ref={searchContainerRef}>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              placeholder="Search for a city or location..."
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <IconLoader className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isSearching || searchQuery.trim().length < 3}
            className="bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <IconSearch className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title="Use current location"
          >
            {isGettingLocation ? (
              <IconLoader className="w-4 h-4 animate-spin" />
            ) : (
              <IconCurrentLocation className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-center">
                  <IconMapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {suggestion.formatted_address}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.type || 'Location'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && !isSearching && searchQuery.trim().length >= 3 && suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
            <div className="text-gray-500 text-sm">No locations found. Try a different search term.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
