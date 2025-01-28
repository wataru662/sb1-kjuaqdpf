import { createClient, FetchError } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper to check if an error object is empty
const isEmptyError = (error: unknown): boolean => {
  if (!error) return true;
  if (typeof error !== 'object') return false;
  return Object.keys(error).length === 0;
};

// Helper to check if an error is an auth error
const isAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  return 'message' in error && error.message === 'Invalid login credentials';
};

// Custom fetch with retry logic
const fetchWithRetry = async (url: string, options: RequestInit, retryCount = 0): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // Don't retry auth errors
    if (!response.ok && response.status === 400) {
      const data = await response.clone().json();
      if (data.code === 'invalid_credentials') {
        return response;
      }
    }
    
    // Only retry on network errors or 5xx server errors
    if (!response.ok && response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    if (isEmptyError(error)) {
      throw new Error('Network request failed with no error details');
    }
    
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item;
        } catch (error) {
          if (!isEmptyError(error)) {
            console.error('Error accessing localStorage:', error);
          }
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          if (!isEmptyError(error)) {
            console.error('Error writing to localStorage:', error);
          }
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          if (!isEmptyError(error)) {
            console.error('Error removing from localStorage:', error);
          }
        }
      }
    }
  },
  global: {
    fetch: async (url, options) => {
      try {
        const response = await fetchWithRetry(url, options);
        return response;
      } catch (error) {
        // Don't log auth errors
        if (!isAuthError(error) && !isEmptyError(error)) {
          console.error('Supabase fetch error:', {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
        throw error;
      }
    }
  }
});

// Helper to handle Supabase errors consistently
const handleSupabaseError = (error: unknown, context: string) => {
  // Don't log or transform auth errors
  if (isAuthError(error)) {
    return error;
  }

  if (isEmptyError(error)) {
    const genericError = new Error(`An error occurred during ${context} with no details`);
    return genericError;
  }

  if (error instanceof Error) {
    if (error.message || error.name || error.stack) {
      console.error(`${context}:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      return error;
    }
  }
  
  const genericError = new Error(`An unknown error occurred during ${context}`);
  console.error(`${context}:`, {
    error,
    timestamp: new Date().toISOString()
  });
  return genericError;
};

// Auth helper functions with improved error handling
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error && !isEmptyError(error)) throw error;
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleSupabaseError(err, 'sign up')
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error && !isEmptyError(error)) throw error;
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleSupabaseError(err, 'sign in')
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error && !isEmptyError(error)) throw error;
    return { error: null };
  } catch (err) {
    return { 
      error: handleSupabaseError(err, 'sign out')
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error && !isEmptyError(error)) throw error;
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleSupabaseError(err, 'password reset')
    };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error && !isEmptyError(error)) throw error;
    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleSupabaseError(err, 'password update')
    };
  }
};

export const recoverSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error && !isEmptyError(error)) throw error;
    if (!session) {
      return { data: null, error: new Error('No session found') };
    }
    
    return { data: session, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: handleSupabaseError(err, 'session recovery')
    };
  }
};