import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
  days: number
  setDays: (d: number) => void
}

const FilterContext = createContext<FilterContextType>({ days: 30, setDays: () => {} })

export function FilterProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState(30)
  return <FilterContext.Provider value={{ days, setDays }}>{children}</FilterContext.Provider>
}

export function useFilter() {
  return useContext(FilterContext)
}
