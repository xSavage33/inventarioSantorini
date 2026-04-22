'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from './Sidebar'
import type { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const safeNavigate = (url: string) => {
  if (typeof window !== 'undefined' && document.readyState === 'complete') {
    window.location.replace(url)
  } else {
    setTimeout(() => window.location.replace(url), 100)
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session) {
        safeNavigate('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_OUT') {
          safeNavigate('/login')
        } else if (session) {
          setUser(session.user)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
