import supabase from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * Sign in with email and password using Supabase Auth
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    return { user: null, error: error as Error };
  }
}

/**
 * Sign up with email and password using Supabase Auth
 */
export async function signUpWithEmail(email: string, password: string, metadata?: { name: string }): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error during sign up:', error);
    return { user: null, error: error as Error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase sign out error:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    return { error: error as Error };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    return { user: null, error: error as Error };
  }
} 