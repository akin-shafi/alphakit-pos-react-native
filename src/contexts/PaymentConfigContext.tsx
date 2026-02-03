import React, { createContext, useState, useContext, useEffect } from "react"
import type { PaymentConfig } from "../types"

interface PaymentConfigContextType {
  config: PaymentConfig
  updateConfig: (config: Partial<PaymentConfig>) => void
  resetConfig: () => void
}

const DEFAULT_CONFIG: PaymentConfig = {
  defaultMode: "ask-every-time",
  enabledMethods: {
    cash: true,
    card: true,
    transfer: true,
    credit: true,
    externalTerminal: true,
  },
  externalTerminalProviders: ["moniepoint", "opay", "other"],
}

const PaymentConfigContext = createContext<PaymentConfigContextType | undefined>(undefined)

export const PaymentConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PaymentConfig>(DEFAULT_CONFIG)

  // Load config from storage on mount
  useEffect(() => {
    // TODO: Load from AsyncStorage
    // AsyncStorage.getItem('paymentConfig').then(data => {
    //   if (data) setConfig(JSON.parse(data))
    // })
  }, [])

  const updateConfig = (updates: Partial<PaymentConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    // TODO: Save to AsyncStorage
    // AsyncStorage.setItem('paymentConfig', JSON.stringify(newConfig))
  }

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    // TODO: Clear from AsyncStorage
    // AsyncStorage.removeItem('paymentConfig')
  }

  return (
    <PaymentConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </PaymentConfigContext.Provider>
  )
}

export const usePaymentConfig = () => {
  const context = useContext(PaymentConfigContext)
  if (!context) {
    throw new Error("usePaymentConfig must be used within PaymentConfigProvider")
  }
  return context
}
