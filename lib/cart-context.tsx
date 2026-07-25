'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Product } from '@/lib/products'

export interface CartItem {
  lineId: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  color?: string
  size?: string
}

interface AddToCartOptions {
  quantity?: number
  color?: string
  size?: string
}

interface CartContextValue {
  items: CartItem[]
  cartCount: number
  subtotal: number
  addToCart: (product: Product, options?: AddToCartOptions) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'shophub-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true)
    }
  }, [])

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [items, hydrated])

  const addToCart = (product: Product, options: AddToCartOptions = {}) => {
    const quantity = options.quantity ?? 1
    const color = options.color ?? product.colors?.[0]?.name
    const size = options.size ?? product.sizes?.[0]

    setItems((prev) => {
      const lineId = [product.id, color, size].filter(Boolean).join('-')
      const existing = prev.find((item) => item.lineId === lineId)

      if (existing) {
        return prev.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...prev,
        {
          lineId,
          productId: product.id,
          name: product.name,
          price: product.discountPrice ?? product.price,
          quantity,
          imageUrl: product.imageUrl,
          color,
          size,
        },
      ]
    })
  }

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineId)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
    )
  }

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId))
  }

  const clearCart = () => setItems([])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, cartCount, subtotal, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de un <CartProvider>')
  return ctx
}
