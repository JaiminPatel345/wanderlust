import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconSearch,
  IconX,
  IconMapPin,
  IconCurrencyRupee,
  IconCurrencyDollar,
  IconStar,
} from '@tabler/icons-react';
import useListingStore from '../../../store/listing.js';
import { ScaleLoader } from 'react-spinners';
import PropTypes from 'prop-types';

// Dropdown component showing search results
const SearchDropdown = ({ searchQuery, onClose }) => {
  const { searchResults, isSearching, clearSearchResults } = useListingStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Navigate to a specific listing
  const handleListingClick = (listingId) => {
    clearSearchResults();
    onClose();
    navigate(`/listings/${listingId}`);
  };

  if (!searchQuery.trim()) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center pt-16"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        ref={dropdownRef}
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <IconSearch size={20} className="text-gray-500 mr-2" />
            <span className="font-medium">Results for &quot;{searchQuery}&quot;</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close search"
          >
            <IconX size={20} />
          </button>
        </div>
        
        {isSearching ? (
          <div className="py-8 flex justify-center">
            <ScaleLoader color="#f43f5e" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((listing, index) => (
              <div 
                key={listing._id}
                className="p-3 hover:bg-gray-50 border-b cursor-pointer transition-colors"
                onClick={() => handleListingClick(listing._id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={listing.image.url} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <IconMapPin size={16} className="mr-1" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <IconCurrencyDollar size={16} className="mr-1" />
                      <span>{listing.pricePerDay ? `₹${listing.pricePerDay.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'Price not set'}</span>
                    </div>
                    {/*<div className="flex items-center text-sm text-gray-700 mt-1">*/}
                    {/*  <IconStar size={16} className="mr-1" />*/}
                    {/*  <span>{listing.reviews && listing.reviews.length > 0 ? `${(listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length).toFixed(1)} (${listing.reviews.length} reviews)` : 'No ratings'}</span>*/}
                    {/*</div>*/}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No results found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};

SearchDropdown.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default SearchDropdown; 