import { useEffect, useState } from 'react'

export function useSessionStart(): number {
  const [sessionStart, setSessionStart] = useState<number | null>(null)

  useEffect(() => {
    if (!sessionStart) {
      setSessionStart(Date.now())
    }
  }, [])

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(Date.now() - (sessionStart ?? Date.now()))
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, sessionStart])

  return Math.floor(seconds / 1000)
}
