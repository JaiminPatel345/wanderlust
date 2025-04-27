import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const useUserStore = create((set) => ({
  currUser: null,
  loading: true,
  
  // Check if user is logged in
  checkCurrUser: async () => {
    try {
      set({ loading: true });
      
      const response = await fetch(`${API_URL}/islogin`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ currUser: data.data.user, loading: false });
        return true;
      } else {
        set({ currUser: null, loading: false });
        return false;
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      set({ currUser: null, loading: false });
      return false;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      set({ loading: true });
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ currUser: data.data.user, loading: false });
        return { success: true };
      } else {
        set({ loading: false });
        // Check if email verification is required
        if (data.data && data.data.requireVerification) {
          return { 
            success: false, 
            requireVerification: true,
            error: data.message || 'Please verify your email' 
          };
        }
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ loading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      set({ loading: true });
      
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      set({ currUser: null, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      set({ loading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  // Update user name
  updateName: async (name) => {
    try {
      const response = await fetch(`${API_URL}/profile/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set((state) => ({
          currUser: { ...state.currUser, name },
        }));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Update name error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  // Update user photo
  updatePhoto: async (photoUrl) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profilePhoto: photoUrl }),
      });
      
      const data = await response.json();
      console.log('update photo updated');
      
      if (response.ok && data.success) {
        set((state) => ({
          currUser: { ...state.currUser, profilePhoto: photoUrl },
        }));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Update photo error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      set({ loading: true });
      
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Only set current user if no verification is required
        if (!data.data.requireVerification) {
          set({ currUser: data.data.user, loading: false });
        } else {
          set({ loading: false });
        }
        return { 
          success: true,
          requireVerification: data.data.requireVerification
        };
      } else {
        set({ loading: false });
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      set({ loading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      set({ loading: true });
      
      const response = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        set({ currUser: data.data.user, loading: false });
        return { 
          success: true,
          isNewUser: data.data.isNewUser
        };
      } else {
        set({ loading: false });
        return { success: false, error: data.message || 'Verification failed' };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      set({ loading: false });
      return { success: false, error: 'Network error occurred' };
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      const response = await fetch(`${API_URL}/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log('resend OTP');
      
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Failed to resend code' };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await response.json();
      console.log('change password');
      
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.message || 'Failed to change password' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  },
}));

export default useUserStore; 