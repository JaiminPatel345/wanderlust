// src/components/FlashMessages.js
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FlashMessages = ({ success, error, warning }) => {
    const [visible, setVisible] = useState(true);

    return visible ? (
        <div>
            {success && (
                <div className="flex justify-between bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    <span>{success}</span>
                    <button className="ml-4" onClick={() => setVisible(false)}>&times;</button>
                </div>
            )}
            {error && (
                <div className="flex justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span>{error}</span>
                    <button className="ml-4" onClick={() => setVisible(false)}>&times;</button>
                </div>
            )}
            {warning && (
                <div className="flex justify-between bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                    <span>{warning}</span>
                    <button className="ml-4" onClick={() => setVisible(false)}>&times;</button>
                </div>
            )}
        </div>
    ) : null;
};

// Add prop-types validation
FlashMessages.propTypes = {
    success: PropTypes.string,  // Optional prop, can be a string
    error: PropTypes.string,    // Optional prop, can be a string
    warning: PropTypes.string   // Optional prop, can be a string
};

export default FlashMessages;
