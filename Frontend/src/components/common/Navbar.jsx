/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import useListingStore from '../../store/listing';
import useUserStore from '../../store/userStore';
import UpdateNameModal from '../ui/user/UpdateNameModal.jsx';
import UpdatePhotoModal from '../ui/user/UpdatePhotoModal.jsx';
import ChangePasswordModal from '../ui/user/ChangePasswordModal.jsx';
import SearchDropdown from '../ui/navbar/SearchDropdown.jsx';
import NotificationDropdown from '../ui/navbar/NotificationDropdown.jsx';
import {shouldShowSearchBar} from '../../utils/navbarUtils';
import NavLink from '../ui/navbar/NavLink.jsx';
import NavButton from '../ui/navbar/NavButton.jsx';
import SearchBar from '../ui/navbar/SearchBar.jsx';
import UserProfileDropdown from '../ui/user/UserProfileDropdown.jsx';
import {
  IconBookmarks,
  IconCamera,
  IconCompass,
  IconEdit,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconUserCircle,
  IconX,
  IconChartBar,
} from '@tabler/icons-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const notShowSearchBarPaths = [
    '/login',
    '/signup',
    '/listings/new',
    '/verify-otp',
    '/profile-setup',
    '/forgot-password',
    '/listings/:id/edit',
  ];
  const showSearchBarPaths = ['/', '/bookmarks', '/listings', '/listings/:id'];

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

  // Check if search bar should be displayed
  const displaySearchBar = shouldShowSearchBar(
      location.pathname,
      showSearchBarPaths,
      notShowSearchBarPaths,
  );

  const mobileMenuButton = (
      <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          aria-label="Toggle menu"
      >
        {isOpen ? <IconX size={24}/> : <IconMenu2 size={24}/>}
      </button>
  );

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

        <NavLink to="/dashboard"
                 className="flex items-center gap-2 hover:text-rose-600">
          <IconChartBar size={20}/>
          Dashboard
        </NavLink>

        {currUser && (
            <div className="md:ml-2">
                <NotificationDropdown />
            </div>
        )}
      </div>
  );

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
        <div className="w-full">
          <nav
              className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <div className=" w-full flex items-center justify-between h-16 gap-4">
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

                {/* Search Bar - Desktop */}
                {displaySearchBar && (
                    <div className="hidden md:flex flex-1 justify-center max-w-2xl">
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

              {/* Mobile Search Bar */}
              {displaySearchBar && (
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
            <div className={`${displaySearchBar
                ? 'h-28'
                : 'h-16'} transition-all duration-300`}></div>
          </div>
        </div>

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
