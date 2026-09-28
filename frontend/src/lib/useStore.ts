import { useState, useEffect } from 'react'

interface Store {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
}

const DEFAULT_STORE: Store = {
  id: 'default',
  name: 'متجري',
  icon: '🏪',
  color: '#d4af37',
  createdAt: new Date().toISOString(),
}

export function useStore() {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('diwan_stores')
    return saved ? JSON.parse(saved) : [DEFAULT_STORE]
  })

  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    return localStorage.getItem('diwan_current_store') || 'default'
  })

  useEffect(() => {
    localStorage.setItem('diwan_stores', JSON.stringify(stores))
  }, [stores])

  useEffect(() => {
    localStorage.setItem('diwan_current_store', currentStoreId)
  }, [currentStoreId])

  const currentStore = stores.find(s => s.id === currentStoreId) || stores[0]

  const addStore = (name: string, icon: string = '🏪') => {
    const colors = ['#d4af37', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899']
    const newStore: Store = {
      id: Date.now().toString(),
      name,
      icon,
      color: colors[stores.length % colors.length],
      createdAt: new Date().toISOString(),
    }
    setStores([...stores, newStore])
    return newStore
  }

  const removeStore = (id: string) => {
    if (id === 'default') return false
    setStores(stores.filter(s => s.id !== id))
    if (currentStoreId === id) setCurrentStoreId('default')
    return true
  }

  const switchStore = (id: string) => {
    if (stores.find(s => s.id === id)) {
      setCurrentStoreId(id)
    }
  }

  // دالة للحصول على prefix للبيانات
  const getDataKey = (key: string) => {
    if (currentStoreId === 'default') return `diwan_${key}`
    return `diwan_${currentStoreId}_${key}`
  }

  return {
    stores,
    currentStore,
    currentStoreId,
    addStore,
    removeStore,
    switchStore,
    getDataKey,
  }
}
