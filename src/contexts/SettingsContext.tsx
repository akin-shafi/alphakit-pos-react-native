
import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "./AuthContext"
import { AuthService } from "../services/AuthService"

interface SettingsContextType {
  enableTables: boolean
  enableDrafts: boolean
  enableTax: boolean
  taxRate: number
  printerType: 'bluetooth' | 'network' | 'internal' | 'none'
  printerAddress: string
  printerName: string
  printerPaperSize: '58mm' | '80mm'
  autoPrint: boolean
  toggleTables: () => Promise<void>
  toggleDrafts: () => Promise<void>
  toggleTax: () => Promise<void>
  updateTaxRate: (rate: number) => Promise<void>
  updatePrinter: (settings: {
    type?: 'bluetooth' | 'network' | 'internal' | 'none'
    address?: string
    name?: string
    paperSize?: '58mm' | '80mm'
    autoPrint?: boolean
  }) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business, setBusiness } = useAuth()
  const [enableTables, setEnableTables] = useState(false)
  const [enableDrafts, setEnableDrafts] = useState(false)
  const [enableTax, setEnableTax] = useState(false)
  const [taxRate, setTaxRate] = useState(0)

  const [printerType, setPrinterType] = useState<'bluetooth' | 'network' | 'internal' | 'none'>('none')
  const [printerAddress, setPrinterAddress] = useState('')
  const [printerName, setPrinterName] = useState('')
  const [printerPaperSize, setPrinterPaperSize] = useState<'58mm' | '80mm'>('80mm')
  const [autoPrint, setAutoPrint] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (business) {
      if (business.table_management_enabled !== undefined && business.table_management_enabled !== enableTables) {
        setEnableTables(business.table_management_enabled)
        AsyncStorage.setItem("enableTables", String(business.table_management_enabled))
      }
      if (business.save_to_draft_enabled !== undefined && business.save_to_draft_enabled !== enableDrafts) {
        setEnableDrafts(business.save_to_draft_enabled)
        AsyncStorage.setItem("enableDrafts", String(business.save_to_draft_enabled))
      }
    }
  }, [business])

  const loadSettings = async () => {
    try {
      const tables = await AsyncStorage.getItem("enableTables")
      const drafts = await AsyncStorage.getItem("enableDrafts")
      const tax = await AsyncStorage.getItem("enableTax")
      const rate = await AsyncStorage.getItem("taxRate")

      const pType = await AsyncStorage.getItem("printerType")
      const pAddress = await AsyncStorage.getItem("printerAddress")
      const pName = await AsyncStorage.getItem("printerName")
      const pSize = await AsyncStorage.getItem("printerPaperSize")
      const pAuto = await AsyncStorage.getItem("autoPrint")
      
      // Only set if business context hasn't already (or fallback)
      if (!business) {
        setEnableTables(tables === "true")
        setEnableDrafts(drafts === "true")
      }
      setEnableTax(tax === "true")
      setTaxRate(rate ? parseFloat(rate) : 0)

      if (pType) setPrinterType(pType as any)
      if (pAddress) setPrinterAddress(pAddress)
      if (pName) setPrinterName(pName)
      if (pSize) setPrinterPaperSize(pSize as any)
      if (pAuto) setAutoPrint(pAuto === "true")
    } catch (e) {
      console.warn("Failed to load settings", e)
    }
  }

  const toggleTables = async () => {
    const newValue = !enableTables
    setEnableTables(newValue)
    await AsyncStorage.setItem("enableTables", String(newValue))
    
    if (business?.id) {
      try {
        const updatedBiz = await AuthService.updateBusiness(business.id, { table_management_enabled: newValue })
        setBusiness(updatedBiz)
      } catch (e) {
        console.warn("Failed to sync tables setting", e)
      }
    }
  }

  const toggleDrafts = async () => {
    const newValue = !enableDrafts
    setEnableDrafts(newValue)
    await AsyncStorage.setItem("enableDrafts", String(newValue))

    if (business?.id) {
      try {
        const updatedBiz = await AuthService.updateBusiness(business.id, { save_to_draft_enabled: newValue })
        setBusiness(updatedBiz)
      } catch (e) {
        console.warn("Failed to sync drafts setting", e)
      }
    }
  }

  const toggleTax = async () => {
    const newValue = !enableTax
    setEnableTax(newValue)
    await AsyncStorage.setItem("enableTax", String(newValue))
  }

  const updateTaxRate = async (rate: number) => {
    setTaxRate(rate)
    await AsyncStorage.setItem("taxRate", String(rate))
  }

  const updatePrinter = async (settings: {
    type?: 'bluetooth' | 'network' | 'internal' | 'none'
    address?: string
    name?: string
    paperSize?: '58mm' | '80mm'
    autoPrint?: boolean
  }) => {
    if (settings.type !== undefined) {
      setPrinterType(settings.type)
      await AsyncStorage.setItem("printerType", settings.type)
    }
    if (settings.address !== undefined) {
      setPrinterAddress(settings.address)
      await AsyncStorage.setItem("printerAddress", settings.address)
    }
    if (settings.name !== undefined) {
      setPrinterName(settings.name)
      await AsyncStorage.setItem("printerName", settings.name)
    }
    if (settings.paperSize !== undefined) {
      setPrinterPaperSize(settings.paperSize)
      await AsyncStorage.setItem("printerPaperSize", settings.paperSize)
    }
    if (settings.autoPrint !== undefined) {
      setAutoPrint(settings.autoPrint)
      await AsyncStorage.setItem("autoPrint", String(settings.autoPrint))
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        enableTables,
        enableDrafts,
        enableTax,
        taxRate,
        printerType,
        printerAddress,
        printerName,
        printerPaperSize,
        autoPrint,
        toggleTables,
        toggleDrafts,
        toggleTax,
        updateTaxRate,
        updatePrinter,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
