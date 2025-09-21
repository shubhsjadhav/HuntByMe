import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getProfile, createProfile } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await getProfile(userId)
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          const { data: newProfile, error: createError } = await createProfile(
            userId,
            user.data.user.email
          )
          if (!createError) {
            setProfile(newProfile)
          }
        }
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isSeeker: profile?.role === 'seeker'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}