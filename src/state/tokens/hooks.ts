import { AppState, AppDispatch } from './../index'
import { TokenData, TokenChartEntry } from './reducer'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateTokenData,
  addTokenKeys,
  addPoolAddresses,
  updateChartData,
  updatePriceData,
  updateTransactions,
} from './actions'
import { isAddress } from 'ethers/lib/utils'
import { fetchPoolsForToken } from 'data/tokens/poolsForToken'
import { fetchTokenChartData } from 'data/tokens/chartData'
import { getIntervalTokenData } from 'data/tokens/priceData'
import { fetchTokenTransactions } from 'data/tokens/transactions'
import { PriceChartEntry, Transaction } from 'types'
import { notEmpty } from 'utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import { useFetchedSubgraphStatus } from 'data/application'
// format dayjs with the libraries that we need
dayjs.extend(utc)

export function useAllTokenData(): {
  [address: string]: { data: TokenData | undefined; lastUpdated: number | undefined }
} {
  const activeNetwork = useActiveNetworks()[0]
  return useSelector((state: AppState) => state.tokens.byAddress[activeNetwork.chainId] ?? {})
}

export function useUpdateTokenData(): (tokens: TokenData[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]

  return useCallback(
    (tokens: TokenData[]) => {
      dispatch(updateTokenData({ tokens, networkId: activeNetwork.chainId }))
    },
    [activeNetwork.chainId, dispatch]
  )
}

export function useAddTokenKeys(): (addresses: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  return useCallback(
    (tokenAddresses: string[]) => dispatch(addTokenKeys({ tokenAddresses, networkId: activeNetwork.chainId })),
    [activeNetwork.chainId, dispatch]
  )
}

export function useTokenDatas(addresses: string[] | undefined): TokenData[] | undefined {
  const allTokenData = useAllTokenData()
  const addTokenKeys = useAddTokenKeys()

  // if token not tracked yet track it
  addresses?.map((a) => {
    if (!allTokenData[a]) {
      addTokenKeys([a])
    }
  })

  const data = useMemo(() => {
    if (!addresses) {
      return undefined
    }
    return addresses
      .map((a) => {
        return allTokenData[a]?.data
      })
      .filter(notEmpty)
  }, [addresses, allTokenData])

  return data
}

export function useTokenData(address: string | undefined): TokenData | undefined {
  const allTokenData = useAllTokenData()
  const addTokenKeys = useAddTokenKeys()

  // if invalid address return
  if (!address || !isAddress(address)) {
    return undefined
  }

  // if token not tracked yet track it
  if (!allTokenData[address]) {
    addTokenKeys([address])
  }

  // return data
  return allTokenData[address]?.data
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function usePoolsForToken(address: string): string[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const token = useSelector((state: AppState) => state.tokens.byAddress[activeNetwork.chainId]?.[address])
  const poolsForToken = token.poolAddresses
  const [error, setError] = useState(false)
  const { dataClient } = useClients()[0]

  useEffect(() => {
    async function fetch() {
      const { loading, error, addresses } = await fetchPoolsForToken(address, dataClient)
      if (!loading && !error && addresses) {
        dispatch(
          addPoolAddresses({ tokenAddress: address, poolAddresses: addresses, networkId: activeNetwork.chainId })
        )
      }
      if (error) {
        setError(error)
      }
    }
    if (!poolsForToken && !error) {
      fetch()
    }
  }, [address, dispatch, error, poolsForToken, dataClient, activeNetwork.chainId])

  // return data
  return poolsForToken
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function useTokenChartData(address: string): TokenChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const token = useSelector((state: AppState) => state.tokens.byAddress[activeNetwork.chainId]?.[address])
  const chartData = token?.chartData
  const [error, setError] = useState(false)
  const { dataClient } = useClients()[0]

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchTokenChartData(address, dataClient)
      if (!error && data) {
        dispatch(updateChartData({ tokenAddress: address, chartData: data, networkId: activeNetwork.chainId }))
      }
      if (error) {
        setError(error)
      }
    }
    if (!chartData && !error) {
      fetch()
    }
  }, [address, dispatch, error, chartData, dataClient, activeNetwork.chainId])

  // return data
  return chartData
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function useTokenPriceData(
  address: string,
  interval: number,
  timeWindow: TimeframeOptions
): PriceChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const token = useSelector((state: AppState) => state.tokens.byAddress[activeNetwork.chainId]?.[address])
  const priceData = token?.priceData?.[interval]
  const [error, setError] = useState(false)
  const { dataClient, blockClient } = useClients()[0]
  // construct timestamps and check if we need to fetch more data
  const oldestTimestampFetched = token?.priceData?.oldestFetchedTimestamp
  const { syncedBlock: latestBlock } = useFetchedSubgraphStatus()

  useEffect(() => {
    const currentTime = dayjs.utc()
    let startTimestamp: number

    switch (timeWindow) {
      case TimeframeOptions.FOUR_HOURS:
        startTimestamp = currentTime.subtract(4, 'hour').startOf('second').unix()
        break
      case TimeframeOptions.ONE_DAY:
        startTimestamp = currentTime.subtract(1, 'day').startOf('minute').unix()
        break
      case TimeframeOptions.THERE_DAYS:
        startTimestamp = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
      case TimeframeOptions.WEEK:
        startTimestamp = currentTime.subtract(1, 'week').startOf('hour').unix()
        break
      case TimeframeOptions.MONTH:
        startTimestamp = currentTime.subtract(1, 'month').startOf('hour').unix()
        break
      default:
        startTimestamp = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
    }

    async function fetch() {
      if (!latestBlock) return
      const data: PriceChartEntry[] = await getIntervalTokenData(
        address,
        startTimestamp,
        interval,
        latestBlock,
        activeNetwork
      )

      if (data?.length) {
        dispatch(
          updatePriceData({
            tokenAddress: address,
            secondsInterval: interval,
            priceData: data,
            oldestFetchedTimestamp: startTimestamp,
            networkId: activeNetwork.chainId,
          })
        )
      } else {
        setError(true)
      }
    }

    if (!priceData && !error && latestBlock) {
      fetch()
    }
  }, [
    activeNetwork,
    activeNetwork.chainId,
    address,
    blockClient,
    dataClient,
    dispatch,
    error,
    interval,
    latestBlock,
    oldestTimestampFetched,
    priceData,
    timeWindow,
  ])

  // return data
  return priceData
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function useTokenTransactions(address: string): Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const token = useSelector((state: AppState) => state.tokens.byAddress[activeNetwork.chainId]?.[address])
  const transactions = token.transactions
  const [error, setError] = useState(false)
  const { dataClient } = useClients()[0]

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchTokenTransactions(address, dataClient)
      if (error) {
        setError(true)
      } else if (data) {
        dispatch(updateTransactions({ tokenAddress: address, transactions: data, networkId: activeNetwork.chainId }))
      }
    }
    if (!transactions && !error) {
      fetch()
    }
  }, [activeNetwork.chainId, address, dataClient, dispatch, error, transactions])

  // return data
  return transactions
}
