import React from 'react';
import {IconMail} from '@tabler/icons-react';

const HostInfo = ({owner}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Hosted by {owner?.name || 'Host'}
        </h2>
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          {owner?.profilePhoto ? (
            <img
              src={owner.profilePhoto}
              alt={owner.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {owner?.name?.charAt(0)?.toUpperCase() || 'H'}
            </span>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl "
          onClick={() => window.location.href = `mailto:${owner?.email}`}
        >
          <IconMail className="w-4 h-4" />
          Contact Host
        </button>
      </div>
    </div>
  );
};

export default HostInfo;
