import { useAllTokenData, useUpdateTokenData, useAddTokenKeys } from './hooks'
import { useEffect, useMemo } from 'react'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'

export default function Updater(): null {
  // updaters
  const addTokenKeys = useAddTokenKeys()

  // intitial data
  const { loading, error, addresses } = useTopTokenAddresses()
  // todo
  // add top pools on first load
  useEffect(() => {
    if (addresses && !error && !loading) {
      addTokenKeys(addresses)
    }
  }, [addTokenKeys, addresses, error, loading])

  // detect for which addresses we havent loaded token data yet
  // TODO
  // const unfetchedTokenAddresses: string[] = useMemo(() => {
  //   return Object.keys(allTokenData).reduce((accum: string[], address) => {
  //     const tokenData = allTokenData[address]
  //     if (!tokenData || !tokenData.data || !tokenData.lastUpdated) {
  //       accum.push(address)
  //     }
  //     return accum
  //   }, [])
  // }, [allTokenData])

  return null
}
