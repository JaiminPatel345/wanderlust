import React from 'react';
import PropTypes from 'prop-types';
import { IconCurrencyDollar, IconCurrencyRupee } from '@tabler/icons-react';
import { 
    calculatePriceWithTax, 
    convertUSDtoINR, 
    formatPrice 
} from '../../../utils/priceUtils';

const PriceDisplay = ({ price, showWithTax = false, displayCurrency = "USD" }) => {
    // Get the actual price to display
    const priceWithTax = calculatePriceWithTax(price, showWithTax);
    
    // All prices in the database are in USD, convert to INR if needed
    let displayPrice = priceWithTax;
    if (displayCurrency === "INR") {
        displayPrice = convertUSDtoINR(priceWithTax);
    }
    
    // Format the price based on currency
    const formattedPrice = formatPrice(displayPrice, displayCurrency);
    
    // Currency symbol and icon
    const CurrencyIcon = displayCurrency === "USD" ? IconCurrencyDollar : IconCurrencyRupee;
    
    return (
        <div className="flex items-center gap-1">
            <CurrencyIcon size={22} className="text-gray-700" />
            <span className="text-xl font-semibold">{formattedPrice}</span>
            {showWithTax && (
                <span className="text-sm text-gray-500 ml-1">(Incl. tax)</span>
            )}
        </div>
    );
};

PriceDisplay.propTypes = {
    price: PropTypes.number.isRequired,
    showWithTax: PropTypes.bool,
    displayCurrency: PropTypes.oneOf(['USD', 'INR']),
};

export default PriceDisplay; 