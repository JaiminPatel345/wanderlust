/* eslint-disable react/prop-types */
import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import useListingStore from '../../../Store/listing';
import useUserStore from '../../../Store/userStore';
import UpdateNameModal from './UpdateNameModal';
import UpdatePhotoModal from './UpdatePhotoModal';
import ChangePasswordModal from './ChangePasswordModal';
import SearchDropdown from '../SearchDropdown';
import {
  IconBookmarks,
  IconCamera,
  IconChevronDown,
  IconCompass,
  IconEdit,
  IconKey,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react';

const NavLink = ({to, children, disabled = false, className = ''}) => (<Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'} 
      ${className}`}
>
  {children}
</Link>);

const NavButton = ({
  onClick, children, variant = 'primary', disabled = false,
}) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium transition-colors';
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    outline: 'border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50',
  };

  return (<button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} disabled:cursor-not-allowed`}
  >
    {children}
  </button>);
};

const SearchBar = ({value, onChange, onFocus}) => (
    <div className="flex gap-2 w-full">
      <div className="relative flex-1">
        <input
            type="search"
            value={value}
            onChange={(e) => {
              e.stopPropagation();
              onChange(e.target.value);
            }}
            onFocus={(e) => {
              e.stopPropagation();
              if (onFocus && value.trim()) onFocus();
            }}
            onKeyDown={(e) => {
              // Prevent dropdown from capturing key events intended for input
              e.stopPropagation();
            }}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Search listings"
        />
        <IconSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
        />
      </div>
    </div>);

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
              <div
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100">
                <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
              </div>
          ) : (
              <div
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <IconUserCircle size={24} className="text-gray-500"/>
              </div>
          )}
          <IconChevronDown
              size={16}
              className={`ml-1 text-gray-600 transition-transform ${isOpen
                  ? 'rotate-180'
                  : ''}`}
          />
        </button>

        {isOpen && (
            <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
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

// Add CSS for the spinner
const spinnerStyles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
    width: '100%',
    backgroundColor: 'white',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '3px solid #3498db',
    animation: 'spin 1s linear infinite',
  },
};

// Add keyframes for the spinner animation
const spinnerKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Use Zustand stores instead of Context
  const {currUser, loading, logout, checkCurrUser} = useUserStore();
  const {
    filterListingOnTyping,
    searchListingsBackend,
    clearSearchResults,
  } = useListingStore();

  // Check for current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      await checkCurrUser();
    };

    fetchUser();

    // Close mobile menu on window resize
    const handleResize = () => window.innerWidth >= 768 && setIsOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkCurrUser]);

  // Reset search query and close menu when location changes
  useEffect(() => {
    // Only reset search query when navigating away from listings page
    if (location.pathname !== '/listings') {
      setSearchQuery('');
    }
    setIsOpen(false);
  }, [location.pathname]);

  // Update search behavior to use backend search with debounce
  useEffect(() => {
        const debounceTimer = setTimeout(async () => {
          if (searchQuery.trim()) {
            await searchListingsBackend(searchQuery);
            setShowSearchDropdown(true);
          } else {
            clearSearchResults();
            setShowSearchDropdown(false);
            filterListingOnTyping(''); // Reset frontend filtering when search is cleared
          }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimer);
      },
      [
        searchQuery,
        searchListingsBackend,
        clearSearchResults,
        filterListingOnTyping,
      ],
  );

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Check if current route is VerifyOTP or ProfileSetup page
  const shouldHideNavbar = ['/verify-otp', '/profile-setup'].some(path =>
      location.pathname.includes(path),
  );

  // If we should hide the navbar, return null
  if (shouldHideNavbar) {
    return null;
  }

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  const handleUpdateName = () => {
    setShowNameModal(true);
  };

  const handleUpdatePhoto = () => {
    setShowPhotoModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  // Handle search query change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Handle close of search dropdown
  const handleCloseSearch = () => {
    setShowSearchDropdown(false);
  };

  // Handle view all results
  const handleViewAllResults = () => {
    setShowSearchDropdown(false);
    // Don't clear the search query when showing all results
    // setSearchQuery('');
  };

  const mobileMenuButton = (<button
      onClick={() => setIsOpen(!isOpen)}
      className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
      aria-label="Toggle menu"
  >
    {isOpen ? <IconX size={24}/> : <IconMenu2 size={24}/>}
  </button>);

  const navigationLinks = (
      <div className={`${isOpen
          ? 'flex flex-col gap-2 py-2'
          : 'hidden'} md:flex md:flex-row md:items-center md:gap-4`}>
        <NavLink to="/listings/new"
                 className="flex items-center gap-2 hover:text-rose-600">
          <IconPlus size={20}/>
          Add Listing
        </NavLink>

        <NavLink to="/bookmarks"
                 className="flex items-center gap-2 hover:text-rose-600">
          <IconBookmarks size={20}/>
          Bookmarks
        </NavLink>

      </div>);

  // Render auth buttons conditionally
  const renderAuthButtons = () => {
    if (loading) {
      return null; // Don't show auth buttons while loading
    }

    return (
        <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
          <div className="flex flex-col md:flex-row gap-2">
            {currUser ? (
                // User profile dropdown (for desktop) or inline options (for mobile)
                <>
                  {/* Desktop view - show dropdown */}
                  <div className="hidden md:block">
                    <UserProfileDropdown
                        user={currUser}
                        onLogout={handleLogout}
                        onUpdateName={handleUpdateName}
                        onUpdatePhoto={handleUpdatePhoto}
                        onChangePassword={handleChangePassword}
                    />
                  </div>

                  {/* Mobile view - show options inline */}
                  <div className="md:hidden bg-gray-50 rounded-lg p-3 mt-2">
                    <div
                        className="flex items-center gap-2 px-2 py-2 mb-2 border-b border-gray-200 pb-2">
                      {currUser.profilePhoto ? (
                          <div
                              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img
                                src={currUser.profilePhoto}
                                alt={currUser.name}
                                className="w-full h-full object-cover"
                            />
                          </div>
                      ) : (
                          <div
                              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                            <IconUserCircle size={24}
                                            className="text-gray-500"/>
                          </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{currUser.name}</p>
                        <p className="text-xs text-gray-500">{currUser.email}</p>
                      </div>
                    </div>

                    <button
                        onClick={handleUpdatePhoto}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center rounded-md mb-1 transition-colors"
                    >
                      <IconCamera size={16} className="mr-2"/>
                      Update Photo
                    </button>

                    <button
                        onClick={handleUpdateName}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center rounded-md mb-1 transition-colors"
                    >
                      <IconEdit size={16} className="mr-2"/>
                      Update Name
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 flex items-center rounded-md transition-colors"
                    >
                      <IconLogout size={16} className="mr-2"/>
                      Log out
                    </button>
                  </div>
                </>
            ) : (
                <>
                  <NavButton
                      onClick={() => navigate('/login')}
                      variant="outline"
                  >
                    Log in
                  </NavButton>
                  <NavButton
                      onClick={() => navigate('/signup')}
                      variant="primary"
                  >
                    Sign up
                  </NavButton>
                </>
            )}
          </div>
        </div>
    );
  };

  return (
      <>
        {loading ? (
            <div style={spinnerStyles.loadingContainer}>
              <div style={spinnerStyles.spinner}></div>
              <style>{spinnerKeyframes}</style>
            </div>
        ) : (
            <div className="w-full">
              <nav
                  className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <IconCompass size={28}/>
                      <span className="hidden md:block font-medium">
                        Explore
                      </span>
                    </Link>

                    {/* Search Bar - Only shown on homepage */}
                    {(location.pathname === '/' || location.pathname ===
                        '/listings') && (
                        <div className="hidden md:flex flex-1 justify-center">
                          <SearchBar
                              value={searchQuery}
                              onChange={handleSearchChange}
                              onFocus={() => searchQuery.trim() &&
                                  setShowSearchDropdown(true)}
                          />
                        </div>
                    )}

                    {/* Navigation Links & Auth Buttons - Hidden on mobile */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                      {navigationLinks}
                      {renderAuthButtons()}
                    </div>

                    {/* Mobile menu button */}
                    {mobileMenuButton}
                  </div>

                  {/* Mobile Search Bar - Only shown on homepage */}
                  {(location.pathname === '/' || location.pathname ===
                      '/listings') && (
                      <div className="md:hidden flex px-1 pb-2">
                        <SearchBar
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery.trim() &&
                                setShowSearchDropdown(true)}
                        />
                      </div>
                  )}

                  {/* Mobile Navigation Links & Auth Buttons */}
                  <div
                      className={`md:hidden pb-4 ${isOpen
                          ? 'block'
                          : 'hidden'}`}
                  >
                    {navigationLinks}
                    {renderAuthButtons()}
                  </div>
                </div>
              </nav>

              {/* Add padding based on navbar height and state */}
              <div className={`${isOpen ? 'h-screen' : ''}`}>
                <div className={`${(location.pathname === '/' ||
                    location.pathname === '/listings')
                    ? 'h-28'
                    : 'h-16'} transition-all duration-300`}></div>
              </div>
            </div>
        )}

        {/* Name Update Modal */}
        <UpdateNameModal
            isOpen={showNameModal}
            onClose={() => setShowNameModal(false)}
        />

        {/* Photo Update Modal */}
        <UpdatePhotoModal
            isOpen={showPhotoModal}
            onClose={() => setShowPhotoModal(false)}
        />

        {/* Password Update Modal */}
        <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
        />

        {/* Search Dropdown */}
        {showSearchDropdown && (
            <SearchDropdown
                searchQuery={searchQuery}
                onClose={handleCloseSearch}
            />
        )}
      </>
  );
};

export default Navigation;
