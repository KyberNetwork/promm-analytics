import { useEffect, useRef, useState } from 'react'

export function useSessionStart(): number {
  const sessionStart = useRef(Date.now())

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(Date.now() - (sessionStart.current ?? Date.now()))
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds])

  return Math.floor(seconds / 1000)
}
