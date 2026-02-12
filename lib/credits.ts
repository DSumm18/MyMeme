'use client'

import { supabase } from './supabase'

const INITIAL_CREDITS = 3
const CREDITS_KEY = 'mymeme_user_credits'

export async function getUserCredits(userId: string): Promise<number> {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Fallback to localStorage if Supabase query fails
      const localCredits = localStorage.getItem(`${CREDITS_KEY}_${userId}`)
      return localCredits ? parseInt(localCredits, 10) : INITIAL_CREDITS
    }

    return data.credits
  } catch (err) {
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
  try {
    // Try Supabase first
    const { data, error } = await supabase.rpc('deduct_credits', { 
      p_user_id: userId, 
      p_amount: amount 
    })

    if (error || data === false) {
      // Fallback to localStorage
      const currentCredits = await getUserCredits(userId)
      if (currentCredits < amount) return false

      const newCredits = currentCredits - amount
      localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
      return true
    }

    return data
  } catch (err) {
    // Fallback to localStorage
    const currentCredits = await getUserCredits(userId)
    if (currentCredits < amount) return false

    const newCredits = currentCredits - amount
    localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
    return true
  }
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  try {
    // Try Supabase first
    const { error } = await supabase.rpc('add_credits', { 
      p_user_id: userId, 
      p_amount: amount 
    })

    if (error) {
      // Fallback to localStorage
      const currentCredits = await getUserCredits(userId)
      const newCredits = currentCredits + amount
      localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
    }
  } catch (err) {
    // Fallback to localStorage
    const currentCredits = await getUserCredits(userId)
    const newCredits = currentCredits + amount
    localStorage.setItem(`${CREDITS_KEY}_${userId}`, newCredits.toString())
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