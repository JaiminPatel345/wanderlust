import React from 'react';
import PropTypes from 'prop-types';
import { IconStar, IconUserCircle } from '@tabler/icons-react';

const ReviewItem = ({ review, onDelete, canDelete, isDeleting }) => (
    <div className="p-5 bg-gray-50 rounded-lg shadow">
        <div className="flex justify-between items-start mb-3">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <IconStar
                        key={i}
                        size={20}
                        className={
                            i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                        }
                        fill={i < review.rating ? "currentColor" : "none"}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
            </span>
        </div>

        <div className="flex items-start gap-3">
            {/* Reviewer's profile photo */}
            <div className="flex-shrink-0">
                {review.owner?.profilePhoto ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                        <img
                            src={review.owner.profilePhoto}
                            alt={review.owner.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                        <IconUserCircle size={20} className="text-gray-500" />
                    </div>
                )}
            </div>
            
            <div className="flex-1">
                <p className="font-medium text-gray-800 mb-1">
                    {review.owner?.name || "demo"}
                </p>
                <p className="text-gray-600">{review.content}</p>
                
                {canDelete && (
                    <button
                        onClick={() => onDelete(review)}
                        disabled={isDeleting}
                        className="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                )}
            </div>
        </div>
    </div>
);

ReviewItem.propTypes = {
    review: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        owner: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            profilePhoto: PropTypes.string
        })
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    canDelete: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired
};

export default ReviewItem; 