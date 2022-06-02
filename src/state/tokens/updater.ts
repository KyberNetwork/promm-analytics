import { useAllTokenData, useUpdateTokenData, useAddTokenKeys } from './hooks'
import { useEffect, useMemo } from 'react'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'
import { useFetchedTokenDatas } from 'data/tokens/tokenData'

export default function Updater(): null {
  // updaters
  const updateTokenDatas = useUpdateTokenData()
  const addTokenKeys = useAddTokenKeys()

  // intitial data
  const allTokenData = useAllTokenData()
  const { loading, error, addresses } = useTopTokenAddresses()

  // add top pools on first load
  useEffect(() => {
    if (addresses && !error && !loading) {
      addTokenKeys(addresses)
    }
  }, [addTokenKeys, addresses, error, loading])

  // detect for which addresses we havent loaded token data yet
  const unfetchedTokenAddresses: string[] = useMemo(() => {
    return Object.keys(allTokenData).reduce((accum: string[], address) => {
      const tokenData = allTokenData[address]
      if (!tokenData || !tokenData.data || !tokenData.lastUpdated) {
        accum.push(address)
      }
      return accum
    }, [])
  }, [allTokenData])

  // update unloaded pool entries with fetched data
  const { error: tokenDataError, loading: tokenDataLoading, data: tokenDatas } = useFetchedTokenDatas(
    unfetchedTokenAddresses
  )

  useEffect(() => {
    if (tokenDatas && !tokenDataError && !tokenDataLoading) {
      updateTokenDatas(Object.values(tokenDatas))
    }
  }, [tokenDataError, tokenDataLoading, tokenDatas, updateTokenDatas])

  return null
}
