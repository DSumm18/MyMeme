'use client'

import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from './supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    checkSession()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (error) {
      console.error('Sign in error:', error)
    }
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)