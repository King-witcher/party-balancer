import { useEffect, useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [value: T, setValue: React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const data = localStorage.getItem(`${key}`)
    if (data) {
      try {
        return JSON.parse(data) as T
      } catch {
        localStorage.setItem(key, JSON.stringify(initialValue))
        return initialValue
      }
    } else return initialValue
  })

  useEffect(() => {
    localStorage.setItem(`${key}`, JSON.stringify(value))
  }, [value, key])

  return [value, setValue]
}
