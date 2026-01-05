import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for persisting state to localStorage
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value if no stored value exists
 * @returns {[*, Function]} - The stored value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Memoized setter that handles function updates
  const setValue = useCallback((value) => {
    setStoredValue((prevValue) => {
      const valueToStore = value instanceof Function ? value(prevValue) : value
      return valueToStore
    })
  }, [])

  // Clear the stored value
  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, clearValue]
}

export default useLocalStorage
