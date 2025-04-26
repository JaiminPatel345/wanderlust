import React, { useState, useRef, useEffect } from 'react';
import {
  IconCamera,
  IconChevronDown,
  IconEdit,
  IconKey,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react';

const UserProfileDropdown = ({
  user,
  onLogout,
  onUpdateName,
  onUpdatePhoto,
  onChangePassword,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOption = (action) => {
    setIsOpen(false);
    if (action === 'logout') {
      onLogout();
    } else if (action === 'update-name') {
      onUpdateName();
    } else if (action === 'update-photo') {
      onUpdatePhoto();
    } else if (action === 'change-password') {
      onChangePassword();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.profilePhoto ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100">
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <IconUserCircle size={24} className="text-gray-500"/>
          </div>
        )}
        <IconChevronDown
          size={16}
          className={`ml-1 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleOption('update-photo')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <IconCamera size={16} className="mr-2"/>
              Update Photo
            </button>

            <button
              onClick={() => handleOption('update-name')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <IconEdit size={16} className="mr-2"/>
              Update Name
            </button>

            <button
              onClick={() => handleOption('change-password')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <IconKey size={16} className="mr-2"/>
              Change Password
            </button>

            <button
              onClick={() => handleOption('logout')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <IconLogout size={16} className="mr-2"/>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown; 