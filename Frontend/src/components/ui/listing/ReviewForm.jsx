import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { IconStar } from '@tabler/icons-react';

const ReviewForm = ({
    onSubmit,
    rating,
    setRating,
    content,
    setContent,
    isLoading,
    showSignupLink,
}) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`p-2 rounded ${
                        rating === value ? "text-yellow-500" : "text-gray-300"
                    }`}
                >
                    <IconStar
                        size={24}
                        fill={rating >= value ? "currentColor" : "none"}
                    />
                </button>
            ))}
        </div>

        <div className="space-y-2">
            <label htmlFor="review" className="block text-sm font-medium">
                Your Review
            </label>
            <textarea
                id="review"
                value={content || ""}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-2 rounded-md p-2 min-h-[100px]"
                required
            />
        </div>

        {showSignupLink && (
            <Link to="/signup" className="text-blue-600 hover:underline block">
                Sign up to leave a review
            </Link>
        )}

        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
            {isLoading ? "Submitting..." : "Submit Review"}
        </button>
    </form>
);

ReviewForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    rating: PropTypes.number.isRequired,
    setRating: PropTypes.func.isRequired,
    content: PropTypes.string.isRequired,
    setContent: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    showSignupLink: PropTypes.bool
};

export default ReviewForm; 