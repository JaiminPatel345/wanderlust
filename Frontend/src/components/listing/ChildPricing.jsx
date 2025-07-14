import React from 'react';
import { IconAlertCircle } from '@tabler/icons-react';

const ChildPricing = ({
  childPricing,
  handleChildAgeChange,
  handleChildPriceChange,
  addChildPricing,
  removeChildPricing,
  selectedCurrency
}) => {
  const isAgeRangeValid = (min, max) => {
    if (min === '' || max === '') return true;
    return parseInt(min) <= parseInt(max);
  };

  const hasAgeOverlap = (currentIndex) => {
    const current = childPricing[currentIndex];

    if (!current || (!current.ageRange.min && current.ageRange.min !== 0) || !current.ageRange.max) return false;

    return childPricing.some((child, index) => {
      if (index === currentIndex || !child.ageRange.min || !child.ageRange.max) return false;
      
      const currentMin = parseInt(current.ageRange.min);
      const currentMax = parseInt(current.ageRange.max);
      const otherMin = parseInt(child.ageRange.min);
      const otherMax = parseInt(child.ageRange.max);
      
      return (currentMin >= otherMin && currentMin <= otherMax) ||
             (currentMax >= otherMin && currentMax <= otherMax) ||
             (currentMin <= otherMin && currentMax >= otherMax);
    });
  };

  const getAgeError = (index) => {
    const child = childPricing[index];
    if (!child) return null;
    
    const min = child.ageRange.min;
    const max = child.ageRange.max;
    
    if (min === '' || max === '') return null;
    
    if (parseInt(min) > parseInt(max)) {
      return 'Max age must be greater than or equal to min age';
    }
    
    if (parseInt(min) >= 18 || parseInt(max) >= 18) {
      return 'Child age must be under 18';
    }
    
    if (hasAgeOverlap(index)) {
      return 'Age range overlaps with another price range';
    }
    
    return null;
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Child Pricing (Optional)</h3>
      
      {childPricing.map((child, index) => {
        const error = getAgeError(index);
        const hasError = !!error;
        
        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Age</label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={child.ageRange.min}
                  onChange={(e) => handleChildAgeChange(index, 'min', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm `}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Age</label>
                <input
                  type="number"
                  min="1"
                  max="17"
                  value={child.ageRange.max}
                  onChange={(e) => handleChildAgeChange(index, 'max', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm `}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price Per Day
                </label>
                <div className="mt-1">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">
                        {selectedCurrency === 'USD' ? '$' : '₹'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={child.pricePerDay}
                      onChange={(e) => handleChildPriceChange(index, e.target.value)}
                      className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="col-span-full -mt-2">
                  <p className="text-sm text-red-600 flex items-start">
                    <IconAlertCircle className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeChildPricing(index)}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
      
      <button
        type="button"
        onClick={addChildPricing}
        className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
      >
        <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Child Price Range
      </button>
    </div>
  );
};

export default ChildPricing;
