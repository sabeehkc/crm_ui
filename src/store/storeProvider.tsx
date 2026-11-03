'use client';

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'

import { store } from './store'
import { setCredentials, setInitialized } from './slices/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userStr = localStorage.getItem('user')

      if (accessToken && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr)
          store.dispatch(setCredentials({ user, accessToken, refreshToken }))
        } catch (e) {
          store.dispatch(setInitialized(true))
        }
      } else {
        store.dispatch(setInitialized(true))
      }
    }
  }, [])

  return <>{children}</>
}

export function StoreProvider({ children }: {children: React.ReactNode}) {
    return (
      <Provider store={store}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </Provider>
    );
}
