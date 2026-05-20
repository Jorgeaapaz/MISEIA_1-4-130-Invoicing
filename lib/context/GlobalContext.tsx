'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { User } from '@/lib/types'

interface GlobalContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const GlobalContext = createContext<GlobalContextType>({
  user: null,
  setUser: () => {},
  loading: false,
})

export function GlobalProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)

  return (
    <GlobalContext.Provider value={{ user, setUser, loading: false }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalContext() {
  return useContext(GlobalContext)
}
