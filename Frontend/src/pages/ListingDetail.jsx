import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ListingDetail = () => {
    const location = useLocation();
    const reviewsRef = useRef(null);
    
    useEffect(() => {
        // Handle scroll to section if specified in navigation state
        if (location.state?.scrollTo) {
            const scrollToSection = () => {
                const element = location.state.scrollTo === 'reviews' ? reviewsRef.current : null;
                if (element) {
                    // Add a small delay to ensure content is loaded
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // If there's a review to highlight
                        if (location.state.highlight) {
                            const reviewElement = document.getElementById(`review-${location.state.highlight}`);
                            if (reviewElement) {
                                reviewElement.classList.add('highlight-review');
                                // Remove highlight after animation
                                setTimeout(() => {
                                    reviewElement.classList.remove('highlight-review');
                                }, 3000);
                            }
                        }
                    }, 500);
                }
            };
            
            scrollToSection();
        }
    }, [location.state]);

    return (
        <div>
            {/* ... other listing content ... */}
            
            {/* Add ref to the reviews section */}
            <div ref={reviewsRef}>
                {/* Your reviews section */}
            </div>
            
            {/* ... rest of your component ... */}
        </div>
    );
};

export default ListingDetail; 