import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationHandler = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Make navigate function available globally for notifications
        window.routerNavigate = navigate;
        
        return () => {
            delete window.routerNavigate;
        };
    }, [navigate]);
    
    // This component doesn't render anything
    return null;
};

export default NavigationHandler; 