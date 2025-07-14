import React from 'react';

const PriceInput = ({
  selectedCurrency,
  exchangeRate,
  formData,
  handleChange,
  nightOnly,
  setFormData,
  setNightOnly,
  formData: { nightOnlyPrice, pricePerDay }
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6">

      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="border-b border-gray-200 pb-6">
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Currency
          </label>
          <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
            <select
              name="currency"
              id="currency"
              value={selectedCurrency}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-md"
              onChange={handleChange}
            >
              <option value="USD">US Dollar ($)</option>
              <option value="INR">Indian Rupee (₹)</option>
            </select>
          </div>
        </div>

        {/* Base Price */}
        <div className="border-b border-gray-200 pb-6">
          <label
            htmlFor="pricePerDay"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Base Price (per night)
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
                name="pricePerDay"
                id="pricePerDay"
                min="0"
                value={pricePerDay}
                required
                className="  block w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md"
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Night Only Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Night-Only Pricing</h4>
            <p className="text-sm text-gray-500">Offer a special rate for night-only bookings</p>
          </div>
          <button
            type="button"
            className={`${nightOnly ? 'bg-rose-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500`}
            onClick={() => setNightOnly(!nightOnly)}
          >
            <span className="sr-only">Night only pricing</span>
            <span
              className={`${nightOnly ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            >
              <span
                className={`${nightOnly ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                aria-hidden="true"
              >
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                  <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span
                className={`${nightOnly ? 'opacity-100 duration-200 ease-in' : 'opacity-0 ease-out duration-100'} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                aria-hidden="true"
              >
                <svg className="h-3 w-3 text-rose-600" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            </span>
          </button>
        </div>

        {/* Night Only Price */}
        {nightOnly && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Night-Only Price
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
                  value={nightOnlyPrice}
                  onChange={(e) => setFormData({ ...formData, nightOnlyPrice: e.target.value })}
                  className="focus:ring-rose-500 focus:border-rose-500 block w-full pl-7 pr-3 py-2 text-base border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {`Price for bookings that don't include overnight stay`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceInput;
