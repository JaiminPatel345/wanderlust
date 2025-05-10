import React, {useContext, useState} from 'react';
import {FlashMessageContext} from '../../../utils/flashMessageContext';
import {createReview, deleteReview} from '../../../api/reviewService';
import useUserStore from '../../../store/userStore';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import ReviewStats from './ReviewStats';

const Review = ({listingId, initialReviews = [], onReviewUpdate}) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState({});
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const {currUser} = useUserStore();
  const {showSuccessMessage, showErrorMessage} = useContext(FlashMessageContext);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      showErrorMessage('Please give Reting');
      return;
    }

    if (!reviewContent) {
      showErrorMessage('Please Write something');
      return;
    }

    if (!currUser) {
      showErrorMessage('Please log in to submit a review');
      setShowSignupPrompt(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview(listingId,
          {rating, content: reviewContent},
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      const newReview = {
        ...result.review,
        owner: {
          _id: currUser.userId,
          name: currUser.name,
          profilePhoto: currUser.profilePhoto,
        },
      };

      setReviews((prev) => [...prev, newReview]);
      setReviewContent('');
      setRating(0);
      showSuccessMessage('Review added successfully');

      // Notify parent component about the review update
      if (onReviewUpdate) {
        onReviewUpdate([...reviews, newReview]);
      }
    } catch (error) {
      showErrorMessage(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDelete = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeletingReview(prev => ({...prev, [review._id]: true}));

    try {
      const result = await deleteReview(listingId, review._id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsDeletingReview(prev => ({...prev, [review._id]: false}));

      const updatedReviews = reviews.filter(r => r._id !== review._id);
      setReviews(updatedReviews);

      // Notify parent component about the review update
      if (onReviewUpdate) {
        onReviewUpdate(updatedReviews);
      }

      showSuccessMessage('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      setIsDeletingReview(prev => ({...prev, [review._id]: false}));
      showErrorMessage('Failed to delete review');
    }
  };

  return (
      <div className="mt-8">
        {/* Review statistics */}
        <ReviewStats reviews={reviews}/>

        {/* Review Form */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
          <ReviewForm
              onSubmit={handleReviewSubmit}
              rating={rating}
              setRating={setRating}
              content={reviewContent}
              setContent={setReviewContent}
              isLoading={isSubmitting}
              showSignupLink={showSignupPrompt}
          />
        </div>

        {/* Individual Reviews */}
        {reviews?.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
              {reviews.map((review) => (
                  <ReviewItem
                      key={review._id}
                      review={review}
                      onDelete={handleReviewDelete}
                      canDelete={
                          currUser &&
                          (currUser.userId === review.owner?._id ||
                              currUser.userId === '66a343a50ff99cdefc1a4657') || false // Admin ID
                      }
                      isDeleting={isDeletingReview[review._id] || false}
                  />
              ))}
            </div>
        ) : (
            <p className="text-gray-500 italic text-center py-4">
              No reviews yet. Be the first to review!
            </p>
        )}
      </div>
  );
};

export default Review; 