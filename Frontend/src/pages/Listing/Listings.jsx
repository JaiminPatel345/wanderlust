import React, { useState } from 'react';
import { useEffect } from 'react';

const Listings = ({ allListings }) => {
    const [activeTags, setActiveTags] = useState([]);
    const [showWithTax, setShowWithTax] = useState(false);

    const taxRate = 0.18; // 18% GST

    const handleTagClick = (tag) => {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const filterListings = (listingTags) => {
        return activeTags.length === 0 || activeTags.every(tag => listingTags.includes(tag));
    };

    const toggleTaxDisplay = () => {
        setShowWithTax(!showWithTax);
    };

    return (
        <div>
            <div id="filters" className="flex justify-around gap-2 flex-wrap mt-7 mb-8">
                {['trending', 'rooms', 'iconic cities', 'mountains', 'castles', 'amazing pools', 'camping', 'farms', 'arctic'].map(tag => (
                    <div
                        key={tag}
                        className={`filter flex flex-col items-center ${activeTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => handleTagClick(tag)}>
                        <div>
                            <i className={`fa-solid fa-${tag === 'trending' ? 'fire' : tag === 'rooms' ? 'bed' : tag === 'iconic cities' ? 'mountain-city' : tag === 'mountains' ? 'mountain' : tag === 'castles' ? 'fort-awesome' : tag === 'amazing pools' ? 'person-swimming' : tag === 'camping' ? 'campground' : tag === 'farms' ? 'tractor' : 'snowflake'}`}></i>
                        </div>
                        <p>{tag.charAt(0).toUpperCase() + tag.slice(1)}</p>
                    </div>
                ))}
                <div className="tax-toggle">
                    <div className="form-check-reverse form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                            checked={showWithTax}
                            onChange={toggleTaxDisplay} />
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Price with Tax</label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3 px-4">
                {allListings.map(listing => {
                    const listingTags = listing.tags.join(',').toLowerCase();
                    const originalPrice = listing.price;
                    const displayedPrice = showWithTax
                        ? (originalPrice + (originalPrice * taxRate)).toLocaleString("en-IN")
                        : originalPrice.toLocaleString("en-IN");

                    return (
                        <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden" data-tags={listingTags}>
                            <a href={`/listings/${listing._id}`} className="block hover:opacity-80 transition">
                                <img src={listing.image.url} className="w-full h-72 object-cover" alt="Image is processing" />
                                <div className="p-4">
                                    <h5 className="text-xl font-semibold mb-2">{listing.title}</h5>
                                    <p className="text-gray-700">
                                        &#8377;<span id={`price-${listing._id}`} data-original-price={originalPrice}>{displayedPrice}</span>
                                        <i className="tax-info text-sm text-gray-500"> (Excluding GST)</i>
                                        <br />
                                        <i className="fa-solid fa-location-dot text-gray-600"></i> {listing.location}
                                        <br />
                                        <i className="fa-solid fa-globe text-gray-600"></i> {listing.country}
                                        <br /><br />
                                        <span className="tags flex flex-wrap gap-2">
                                            {listing.tags.map(tag => (
                                                tag !== "null" && (
                                                    <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <i className="fa-light fa-hashtag"></i> {tag}
                                                    </span>
                                                )
                                            ))}
                                        </span>
                                    </p>
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Listings;
