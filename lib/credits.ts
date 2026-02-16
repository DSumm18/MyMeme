'use client'

import { supabase } from './supabase'

const INITIAL_CREDITS = 3
const CREDITS_KEY = 'mymeme_user_credits'

// SECURITY: Validate Supabase is properly configured
function isSupabaseConfigured(): boolean {
  try {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  } catch {
    return false
  }
}

// SECURITY: Validate user ID format
function isValidUserId(userId: string): boolean {
  // Should be non-empty string (UUID v4 or similar)
  return typeof userId === 'string' && userId.length > 0 && userId.length < 200
}

export async function getUserCredits(userId: string): Promise<number> {
  // Validate input
  if (!isValidUserId(userId)) {
    console.error('Invalid userId:', userId)
    return INITIAL_CREDITS
  }

  try {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('Supabase fetch failed, falling back to localStorage:', error.message)
      } else if (data?.credits !== undefined) {
        return data.credits
      }
    }

    // Fallback to localStorage
    const localCredits = localStorage.getItem(`${CREDITS_KEY}_${userId}`)
    return localCredits ? parseInt(localCredits, 10) : INITIAL_CREDITS
  } catch (err) {
    console.error('Error getting credits:', err)
    // If everything fails, return initial credits
    return INITIAL_CREDITS
  }
}

export async function initializeUserCredits(userId: string): Promise<void> {
  try {
    // Try to insert in Supabase
    const { error } = await supabase
      .from('user_credits')
      .upsert({ 
        user_id: userId, 
        credits: INITIAL_CREDITS 
      })
      .select()

    if (error) {
      // Fallback to localStorage if Supabase insert fails
      localStorage.setItem(`${CREDITS_KEY}_${userId}`, INITIAL_CREDITS.toString())
    }
  } catch (err) {
    // Fallback to localStorage if anything goes wrong
    localStorage.setItem(`${CREDITS_KEY}_${userId}`, INITIAL_CREDITS.toString())
  }
}

export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    console.error('Invalid userId for deductCredits:', userId)
    return false
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    console.error('Invalid deduct amount:', amount)
    return false
  }

  try {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('deduct_credits', { 
        p_user_id: userId, 
        p_amount: amount 
      })

      if (error) {
        console.warn('Supabase RPC failed, falling back to localStorage:', error.message)
      } else if (data === true) {
        return true
      } else if (data === false) {
        console.warn('Insufficient credits for deduction')
        return false
      }
    }

    // Fallback to localStorage
    const currentCredits = await getUserCredits(userId)
    if (currentCredits < amount) {
      console.warn('Insufficient credits (localStorage fallback)')
      return false
    }

    const newCredits = currentCredits - amount
    localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
    return true
  } catch (err) {
    console.error('Error deducting credits:', err)
    // Try localStorage fallback on error
    try {
      const currentCredits = await getUserCredits(userId)
      if (currentCredits < amount) return false

      const newCredits = currentCredits - amount
      localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
      return true
    } catch {
      return false
    }
  }
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    console.error('Invalid userId for addCredits:', userId)
    return
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    console.error('Invalid add amount:', amount)
    return
  }

  try {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const { error } = await supabase.rpc('add_credits', { 
        p_user_id: userId, 
        p_amount: amount 
      })

      if (!error) {
        return // Success
      }

      console.warn('Supabase RPC failed, falling back to localStorage:', error?.message)
    }

    // Fallback to localStorage
    const currentCredits = await getUserCredits(userId)
    const newCredits = currentCredits + amount
    localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
  } catch (err) {
    console.error('Error adding credits:', err)
    // Try localStorage fallback
    try {
      const currentCredits = await getUserCredits(userId)
      const newCredits = currentCredits + amount
      localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
    } catch {
      console.error('Failed to add credits even in localStorage fallback')
    }
  }
}

// Helper RPC functions for Supabase (to be created in Supabase SQL editor)
/*
-- In Supabase SQL Editor, create these functions:
CREATE OR REPLACE FUNCTION mymeme.deduct_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM mymeme.user_credits 
  WHERE user_id = p_user_id;

  -- Check if enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE mymeme.user_credits 
  SET credits = credits - p_amount 
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mymeme.add_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Upsert credits (insert if not exists, otherwise update)
  INSERT INTO mymeme.user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET credits = mymeme.user_credits.credits + p_amount;
END;
$$ LANGUAGE plpgsql;
*/