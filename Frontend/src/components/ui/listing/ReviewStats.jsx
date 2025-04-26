import React from 'react';
import PropTypes from 'prop-types';
import { IconStar } from '@tabler/icons-react';
import { calculateAverageRating, calculateRatingDistribution } from '../../../utils/reviewUtils';

const ReviewStats = ({ reviews }) => {
    const avgRating = calculateAverageRating(reviews);
    const reviewCount = reviews.length;
    const distribution = calculateRatingDistribution(reviews);

    return (
        <div className="bg-white p-5 rounded-lg border shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-5">Guest Reviews</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left column - Average and count */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold">{avgRating}</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconStar
                                    key={star}
                                    size={24}
                                    className="text-yellow-500"
                                    fill={star <= parseFloat(avgRating) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
                
                {/* Right column - Rating distribution */}
                {reviewCount > 0 && (
                    <div className="space-y-2">
                        {distribution.map(item => (
                            <div key={item.rating} className="flex items-center gap-2">
                                <span className="w-10 text-sm text-gray-600">{item.rating}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-yellow-400 h-2.5 rounded-full" 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600">{item.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

ReviewStats.propTypes = {
    reviews: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            rating: PropTypes.number.isRequired
        })
    ).isRequired
};

export default ReviewStats; 