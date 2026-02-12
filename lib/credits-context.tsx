'use client'

import React, { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from './auth-context'
import { 
  getUserCredits, 
  initializeUserCredits, 
  deductCredits as creditsDeductCredits 
} from './credits'

interface CreditsContextType {
  credits: number
  loading: boolean
  deductCredits: (amount: number) => Promise<boolean>
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  loading: true,
  deductCredits: async () => false,
  refreshCredits: async () => {}
})

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchCredits = async (userId: string) => {
    setLoading(true)
    try {
      // If it's a new user, initialize credits first
      const currentCredits = await getUserCredits(userId)
      setCredits(currentCredits)
    } catch (error) {
      console.error('Error fetching credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    if (user) {
      await fetchCredits(user.id)
    }
  }

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user) return false

    setLoading(true)
    try {
      const success = await creditsDeductCredits(user.id, amount)
      if (success) {
        setCredits(prev => prev - amount)
      }
      return success
    } catch (error) {
      console.error('Error deducting credits:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // When auth state changes, fetch or initialize credits
  useEffect(() => {
    if (user) {
      // Check if user already has credits, if not, initialize
      fetchCredits(user.id)
    } else {
      // Reset when no user
      setCredits(0)
      setLoading(false)
    }
  }, [user])

  return (
    <CreditsContext.Provider value={{ 
      credits, 
      loading, 
      deductCredits, 
      refreshCredits 
    }}>
      {children}
    </CreditsContext.Provider>
  )
}

export const useCredits = () => useContext(CreditsContext)