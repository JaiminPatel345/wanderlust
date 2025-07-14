import React from 'react';
import PropTypes from 'prop-types';
import { IconUserCircle, IconMail } from '@tabler/icons-react';

const OwnerInfo = ({ owner, listingTitle, canModifyListing }) => {
    if (!owner) return null;
    
    return (
        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex items-center">
                {owner.profilePhoto ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src={owner.profilePhoto}
                            alt={owner.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                        <IconUserCircle size={24} className="text-gray-500" />
                    </div>
                )}
                <div className="ml-3">
                    <span className="text-sm text-gray-500">Hosted by</span>
                    <h3 className="font-medium text-gray-800">{owner.name}</h3>
                </div>
            </div>
            
            <div className="ml-auto">
                {!canModifyListing && (
                    <a
                        href={`mailto:${owner.email}?subject=Inquiry about ${listingTitle}`}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                        <IconMail size={18} />
                        Contact Host
                    </a>
                )}
            </div>
        </div>
    );
};

OwnerInfo.propTypes = {
    owner: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        profilePhoto: PropTypes.string
    }),
    listingTitle: PropTypes.string.isRequired,
    canModifyListing: PropTypes.bool.isRequired
};

export default OwnerInfo; 