// Utility function to calculate average rating
export const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
};

// Calculate rating distribution (5★, 4★, etc.)
export const calculateRatingDistribution = (reviews) => {
    const reviewCount = reviews?.length || 0;
    
    return [5, 4, 3, 2, 1].map(rating => {
        const count = reviews?.filter(r => Math.floor(r.rating) === rating).length || 0;
        const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
        return { rating, count, percentage };
    });
};

// Add a review to the listing
export const addReview = async (listingId, reviewData) => {
    try {
        const response = await fetch(
            `${process.env.VITE_API_BASE_URL}/listings/${listingId}/reviews`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(reviewData),
            }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return { success: true, review: data.review };
    } catch (error) {
        return { success: false, error: error.message || "Failed to submit review" };
    }
};

// Delete a review from the listing
export const deleteReview = async (listingId, reviewId) => {
    try {
        const response = await fetch(
            `${process.env.VITE_API_BASE_URL}/listings/${listingId}/reviews/${reviewId}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message || "Failed to delete review" };
    }
}; 