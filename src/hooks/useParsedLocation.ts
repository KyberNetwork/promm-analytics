import React, { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

export function useParsedLocation() {
  const location = useLocation()
  const { networkID: currentNetworkURL } = useParams<{ networkID: string }>()

  const pathSplited = location.pathname.split('/').slice(currentNetworkURL ? 2 : 1)
  return useMemo(
    () => ({
      network: currentNetworkURL,
      page: pathSplited[0],
      path: '/' + pathSplited.join('/'),
    }),
    [location.pathname]
  )
}
