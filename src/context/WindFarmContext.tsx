import React, { createContext, useState, ReactNode, useContext } from 'react'

type TurbinePosition = [number, number, number]

interface WindFarmContextType {
  turbinesPositions: TurbinePosition[]
  setTurbinesPositions: (positions: TurbinePosition[]) => void
}

const WindFarmContext = createContext<WindFarmContextType | undefined>(undefined)

export const WindFarmProvider = ({ children }: { children: ReactNode }) => {
  const [turbinesPositions, setTurbinesPositions] = useState<TurbinePosition[]>([])

  return (
    <WindFarmContext.Provider value={{ turbinesPositions, setTurbinesPositions }}>
      {children}
    </WindFarmContext.Provider>
  )
}

export function useWindFarm() {
  const context = useContext(WindFarmContext)
  if (!context) {
    throw new Error('useWindFarm must be used within a WindFarmProvider')
  }
  return context
}
