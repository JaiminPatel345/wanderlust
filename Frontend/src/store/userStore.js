import {create} from 'zustand';
import {
  checkAuth,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  verifyOTP as apiVerifyOTP,
} from '../api/authService';
import {
  changePassword as apiChangePassword,
  updateUserName,
  updateUserProfile,
} from '../api/userService';
import {clearAuthData, getUserData, isLoggedIn} from '../utils/tokenUtils.js';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const useUserStore = create((set) => ({
  currUser: null,
  loading: false,

  // Check if user is logged in
  checkCurrUser: async () => {
    try {
      set({loading: true});

      // First check if we have a token and user data in local storage
      if (isLoggedIn()) {
        const userData = getUserData();
        if (userData) {
          set({currUser: userData, loading: false});
          return true;
        }
      } else {
        set({loading: false});
        return false;
      }

      // If no local data or it's invalid, try backend
      const response = await checkAuth();

      if (response.success) {
        set({currUser: response.data.user, loading: false});
        return true;
      } else {
        set({currUser: null, loading: false});
        return false;
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      set({currUser: null, loading: false});
      return false;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      set({loading: true});

      const response = await apiLogin(email, password);

      if (response.success) {
        set({currUser: response.data.user, loading: false});
        return {success: true};
      } else {
        set({loading: false});
        // Check if email verification is required
        if (response.data && response.data.requireVerification) {
          return {
            success: false,
            requireVerification: true,
            error: response.message || 'Please verify your email',
          };
        }
        return {success: false, error: response.message || 'Login failed'};
      }
    } catch (error) {
      console.error('Login error:', error);
      set({loading: false});
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({loading: true});

      await apiLogout();
      clearAuthData();

      set({currUser: null, loading: false});
      return {success: true};
    } catch (error) {
      console.error('Logout error:', error);
      set({loading: false});
      clearAuthData(); // Still clear local data even if API fails
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Update user name
  updateName: async (name) => {
    try {
      const response = await updateUserName(name);

      if (response.success) {
        set((state) => ({
          currUser: {...state.currUser, name},
        }));
        return {success: true};
      } else {
        return {success: false, error: response.message || 'Update failed'};
      }
    } catch (error) {
      console.error('Update name error:', error);
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Update user photo
  updatePhoto: async (photoUrl) => {
    try {
      const response = await updateUserProfile({profilePhoto: photoUrl});

      if (response.success) {
        set((state) => ({
          currUser: {...state.currUser, profilePhoto: photoUrl},
        }));
        return {success: true};
      } else {
        return {success: false, error: response.message || 'Update failed'};
      }
    } catch (error) {
      console.error('Update photo error:', error);
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      set({loading: true});

      const response = await apiRegister(userData);

      if (response.success) {
        // Only set current user if no verification is required
        if (!response.data.requireVerification) {
          set({currUser: response.data.user, loading: false});
        } else {
          set({loading: false});
        }
        return {
          success: true,
          requireVerification: response.data.requireVerification,
        };
      } else {
        set({loading: false});
        return {
          success: false,
          error: response.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      set({loading: false});
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      set({loading: true});

      const response = await apiVerifyOTP(email, otp);

      if (response.success) {
        set({currUser: response.data.user, loading: false});
        return {
          success: true,
          isNewUser: response.data.isNewUser,
        };
      } else {
        set({loading: false});
        return {
          success: false,
          error: response.message || 'Verification failed',
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      set({loading: false});
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiChangePassword(currentPassword, newPassword);

      if (response.success) {
        return {success: true, message: response.message};
      } else {
        return {
          success: false,
          error: response.message || 'Failed to change password',
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {success: false, error: error.message || 'Network error occurred'};
    }
  },
}));

export default useUserStore; 