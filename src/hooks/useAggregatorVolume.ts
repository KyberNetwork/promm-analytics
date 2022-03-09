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
    fetch(`${process.env.REACT_APP_AGGREGATOR_STATS_API}/api/volume`)
      .then((res) => res.json())
      .then((res) => {
        setData(res)
      })
  }, [])

  return data
}
