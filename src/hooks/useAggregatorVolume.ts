import { AGGREGATOR_STATS_API } from 'constants/env'
import { useEffect, useState } from 'react'

interface VolumeResponse {
  totalVolume: number
  last24hVolume: number
}

export default function useAggregatorVolume(): VolumeResponse {
  const [data, setData] = useState({
    totalVolume: 0,
    last24hVolume: 0,
  })

  useEffect(() => {
    fetch(`${AGGREGATOR_STATS_API}/api/volume`)
      .then((res) => res.json())
      .then((res) => {
        setData(res)
      })
      .catch(console.error)
  }, [])

  return data
}
