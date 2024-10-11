import React from "react";

const ShowListing = ({ listing, currUser }) => {
    return (
        <div className="container mx-auto mt-10">
            <div className="w-full md:w-2/3 mx-auto">
                <h3 className="text-2xl font-semibold mb-4">Listing Details</h3>

                <div className="card bg-white shadow-lg">
                    <img src={listing.image.url} className="w-full h-64 object-cover" alt="Image loading..." />
                    <div className="p-4">
                        <h5 className="text-xl font-bold mb-2">{listing.title}</h5>
                        <p className="text-gray-700 mb-4">{listing.description}</p>
                        <p className="text-gray-500">Owned by <i>{listing.owner.name}</i></p>
                        <p className="text-lg font-semibold mt-2">₹ {listing.price.toLocaleString("en-IN")}</p>
                        <p className="mt-2"><i className="fas fa-location-dot"></i> {listing.location}</p>
                        <p className="mt-2"><i className="fas fa-globe"></i> {listing.country}</p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {listing.tags.map((tag, index) => (
                                tag !== "null" && (
                                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                                        <i className="fas fa-hashtag"></i> {tag}
                                    </span>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-4">
                    {currUser && (listing.owner.id === currUser.id) && (
                        <>
                            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Edit
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowListing;
