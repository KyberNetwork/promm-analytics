import React, { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

export function useParsedLocation() {
  const location = useLocation()
  const { network: currentNetworkURL } = useParams<{ network: string }>()

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
