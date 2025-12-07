// Sync service for offline/online data synchronization
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Sale } from "../types"

const PENDING_SALES_KEY = "@pending_sales"
const LAST_SYNC_KEY = "@last_sync"

export const SyncService = {
  /**
   * Save pending sale for later sync
   * @param sale - Sale to queue
   */
  async queueSale(sale: Sale): Promise<void> {
    const pending = await this.getPendingSales()
    pending.push(sale)
    await AsyncStorage.setItem(PENDING_SALES_KEY, JSON.stringify(pending))
  },

  /**
   * Get all pending sales
   * @returns List of pending sales
   */
  async getPendingSales(): Promise<Sale[]> {
    const data = await AsyncStorage.getItem(PENDING_SALES_KEY)
    return data ? JSON.parse(data) : []
  },

  /**
   * Clear pending sales after successful sync
   */
  async clearPendingSales(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_SALES_KEY)
  },

  /**
   * Sync all pending data with backend
   */
  async syncAll(): Promise<{ success: boolean; synced: number; failed: number }> {
    const pending = await this.getPendingSales()
    let synced = 0
    let failed = 0

    for (const sale of pending) {
      try {
        // TODO: Call SalesService.createSale(sale)
        synced++
      } catch (error) {
        failed++
        console.error("Failed to sync sale:", error)
      }
    }

    if (failed === 0) {
      await this.clearPendingSales()
      await this.updateLastSync()
    }

    return { success: failed === 0, synced, failed }
  },

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
  },

  /**
   * Get last sync time
   * @returns Last sync date or null
   */
  async getLastSyncTime(): Promise<Date | null> {
    const data = await AsyncStorage.getItem(LAST_SYNC_KEY)
    return data ? new Date(data) : null
  },
}
