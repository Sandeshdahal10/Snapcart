'use client'
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { hydrateCart } from './cartSlice'

const CART_KEY = "snapcart-cart"

function StoreProvider({children}: {children: React.ReactNode}) {
  // Keep the cart after a page refresh: load it once, then save on every change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) store.dispatch(hydrateCart(JSON.parse(saved)))
    } catch {
      // ignore broken or unavailable storage
    }
    let last = JSON.stringify(store.getState().cart.cartData)
    const unsubscribe = store.subscribe(() => {
      const current = JSON.stringify(store.getState().cart.cartData)
      if (current !== last) {
        last = current
        try {
          localStorage.setItem(CART_KEY, current)
        } catch {
          // ignore
        }
      }
    })
    return unsubscribe
  }, [])

  return (
   <Provider store={store}>
    {children}
   </Provider>
  )
}

export default StoreProvider
