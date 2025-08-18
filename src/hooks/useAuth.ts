import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        
        console.log('Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user })
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
        
        // Set initializing to false after any auth state change
        if (initializing) {
          setInitializing(false)
        }
      }
    )

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        
        console.log('Initial session check:', { hasSession: !!session, hasUser: !!session?.user })
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
        setInitializing(false)
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
          setInitializing(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } finally {
      // Don't set loading to false here - let onAuthStateChange handle it
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    try {
      console.log('Attempting sign out. Current session:', !!session, 'Current user:', !!user);
      
      // Check if we have a session to sign out from
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('Current session from Supabase:', !!currentSession.session);
      
      if (!currentSession.session) {
        // No session exists, clear local state and redirect
        console.log('No active session found, clearing local auth state');
        setSession(null);
        setUser(null);
        return { error: null }; // Don't treat this as an error
      }
      
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error });
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: err };
    }
  }

  return {
    user,
    session,
    loading,
    initializing,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }
}