import React from 'react';
import {IconCalendar, IconUsers, IconTrash} from '@tabler/icons-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingCard = ({
  listing,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
  adults,
  setAdults,
  children,
  setChildren,
  totalPrice,
  handleBookNow,
  showGuestSelector,
  setShowGuestSelector,
}) => {
  const addChild = () => {
    setChildren([...children, {age: 5}]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChildAge = (index, age) => {
    const updatedChildren = [...children];
    updatedChildren[index].age = age;
    setChildren(updatedChildren);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Price Section */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">${listing.pricePerDay}</span>
          <span className="text-gray-600">per night</span>
        </div>
        {listing.nightOnlyPrice && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Night only:</span>
            <span className="font-medium text-gray-900">${listing.nightOnlyPrice}</span>
          </div>
        )}
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Check-in
            </label>
            <div className="relative">
              <DatePicker
                selected={checkInDate}
                onChange={date => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date()}
                placeholderText="Add date"
                dateFormat="MMM d, yyyy"
                className="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-gray-400"
                wrapperClassName="w-full"
                popperClassName="z-50"
              />
              <IconCalendar className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
              Check-out
            </label>
            <div className="relative">
              <DatePicker
                selected={checkOutDate}
                onChange={date => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                placeholderText="Add date"
                dateFormat="MMM d, yyyy"
                className="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-gray-400"
                wrapperClassName="w-full"
                popperClassName="z-50"
              />
              <IconCalendar className="absolute right-3 top-4 w-5 h-5 text-gray-400 pointer-events-none"/>
            </div>
            {checkInDate && checkOutDate && checkOutDate <= checkInDate && (
              <div className="text-red-500 text-sm mt-1">Check-out date must be after check-in date</div>
            )}
          </div>
        </div>
      </div>

      {/* Guests selector */}
      <div className="relative mb-6 guest-selector-container">
        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
          Guests
        </label>
        <div
          className="w-full p-4 border border-gray-300 rounded-xl bg-white cursor-pointer hover:border-gray-400 transition-all duration-200"
          onClick={() => setShowGuestSelector(!showGuestSelector)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-gray-400"/>
              <span className="text-sm text-gray-900">
                {adults} adults, {children?.length} children
              </span>
            </div>
            <div className={`transform transition-transform duration-200 ${showGuestSelector ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        {showGuestSelector && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto"
          >
            {/* Adults */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium text-gray-900">Adults</div>
                <div className="text-sm text-gray-600">Ages 18+</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdults(Math.max(1, adults - 1));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={adults <= 1}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                  </svg>
                </button>
                <span className="w-8 text-center font-medium text-gray-900">{adults}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdults(adults + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium text-gray-900">Children</div>
                  <div className="text-sm text-gray-600">Ages 0-17</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addChild();
                  }}
                  className="px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600 text-sm"
                >
                  Add Child
                </button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Child {index + 1}</span>
                    <select
                      value={child.age}
                      onChange={(e) => updateChildAge(index, parseInt(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Array.from({length: 18}, (_, i) => (
                        <option key={i} value={i}>Age {i}</option>
                      ))}
                    </select>
                    {listing.childPricing && (
                      <span className="text-sm text-gray-600">
                        ${listing.childPricing.find(cp =>
                          child.age >= cp.ageRange.min &&
                          child.age <= cp.ageRange.max,
                        )?.pricePerDay || listing.pricePerDay}/night
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChild(index);
                    }}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Total Price */}
      {totalPrice > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">${totalPrice}</span>
          </div>
          {checkInDate && checkOutDate && (
            <div className="mt-2 text-sm text-gray-600">
              {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} nights
            </div>
          )}
        </div>
      )}

      {/* Book Now Button */}
      <button
        onClick={handleBookNow}
        className="w-full bg-blue-500  text-white font-semibold py-4 px-6 rounded-xl  transform hover:scale-105 shadow-lg hover:shadow-xl duration-300"
      >
        {totalPrice > 0 ? 'Reserve' : 'Check availability'}
      </button>

      {/*/!* Booking Note *!/*/}
      {/*<div className="mt-4 text-center">*/}
      {/*  <p className="text-sm text-gray-600">{`You won't be charged yet`}</p>*/}
      {/*</div>*/}

      {/* Price Breakdown */}
      {checkInDate && checkOutDate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Price breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${ (Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) ) === 1 ? listing.nightOnlyPrice : listing.pricePerDay} × {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) } nights × {adults} adults
              </span>
              <span className="text-gray-900">
                ${((Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) ) === 1 ? listing.nightOnlyPrice : listing.pricePerDay) * Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) * adults}
              </span>
            </div>

            {children.length > 0 &&
              children.map((child, index) => {
                const childPricing = listing.childPricing?.find(
                  cp =>
                    child.age >= cp.ageRange.min &&
                    child.age <= cp.ageRange.max,
                );
                const childPrice = childPricing ? childPricing.pricePerDay : listing.pricePerDay;
                const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Child {index + 1} (age {child.age}) × {nights} nights
                    </span>
                    <span className="text-gray-900">
                      ${childPrice * nights}
                    </span>
                  </div>
                );
              })}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Pricing Information */}
      {listing.childPricing && listing.childPricing.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Child Pricing</h3>
          <div className="space-y-2">
            {listing.childPricing.map((pricing, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Ages {pricing.ageRange.min}-{pricing.ageRange.max}
                </span>
                <span className="text-gray-900">
                  ${pricing.pricePerDay}/night
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
