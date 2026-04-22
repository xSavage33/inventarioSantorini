'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      // Esperar a que el documento esté completamente cargado
      if (document.readyState !== 'complete') {
        await new Promise(resolve => window.addEventListener('load', resolve, { once: true }))
      }

      if (!mounted) return

      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      if (session) {
        window.location.replace('/dashboard')
      } else {
        window.location.replace('/login')
      }
    }

    checkAuth()

    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
