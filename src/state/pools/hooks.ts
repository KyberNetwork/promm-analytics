import {
  addPoolKeys,
  updatePoolChartData,
  updatePoolRatesData,
  updatePoolTransactions,
  updateTickData,
} from 'state/pools/actions'
import { AppState, AppDispatch } from './../index'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PoolData, PoolChartEntry, PoolRatesEntry } from './reducer'
import { updatePoolData } from './actions'
import { notEmpty } from 'utils'
import { fetchPoolChartData } from 'data/pools/chartData'
import { Transaction } from 'types'
import { fetchPoolTransactions } from 'data/pools/transactions'
import { PoolTickData } from 'data/pools/tickData'
import { useActiveNetworks, useActiveNetworkUtils, useClients } from 'state/application/hooks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import { getHourlyRateData } from 'data/pools/hourlyRatesData'
import dayjs from 'dayjs'
import { useFetchedSubgraphStatus } from 'data/application'
import { usePrevious } from 'react-use'

export function useAllPoolData(): {
  [address: string]: { data: PoolData | undefined; lastUpdated: number | undefined }
} {
  const { chainId } = useActiveNetworkUtils()
  return useSelector((state: AppState) => state.pools.byAddress[chainId] ?? {})
}

export function useUpdatePoolData(): (pools: PoolData[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  const { chainId } = useActiveNetworkUtils()
  return useCallback((pools: PoolData[]) => dispatch(updatePoolData({ pools, networkId: chainId })), [
    dispatch,
    chainId,
  ])
}

export function useAddPoolKeys(): (addresses: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  const network = useActiveNetworks()[0]
  return useCallback(
    (poolAddresses: string[]) => dispatch(addPoolKeys({ poolAddresses, networkId: network.chainId })),
    [dispatch, network.chainId]
  )
}

export function usePoolDatas(poolAddresses: string[]): PoolData[] {
  const allPoolData = useAllPoolData()
  const addPoolKeys = useAddPoolKeys()

  const untrackedAddresses = poolAddresses.reduce((accum: string[], address) => {
    if (!Object.keys(allPoolData).includes(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  useEffect(() => {
    if (untrackedAddresses) {
      addPoolKeys(untrackedAddresses)
    }
    return
  }, [addPoolKeys, untrackedAddresses])

  // filter for pools with data
  const poolsWithData = poolAddresses
    .map((address) => {
      const poolData = allPoolData[address]?.data
      return poolData ?? undefined
    })
    .filter(notEmpty)

  return poolsWithData
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function usePoolChartData(address: string): PoolChartEntry[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]

  const pool = useSelector((state: AppState) => state.pools.byAddress[activeNetwork.chainId]?.[address])
  const chartData = pool?.chartData
  const [error, setError] = useState(false)
  const { dataClient } = useClients()[0]

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchPoolChartData(address, dataClient)
      if (!error && data) {
        dispatch(updatePoolChartData({ poolAddress: address, chartData: data, networkId: activeNetwork.chainId }))
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
 * Get all transactions on pool
 * @param address
 */
export function usePoolTransactions(address: string, prices: number[]): Transaction[] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const pool = useSelector((state: AppState) => state.pools.byAddress[activeNetwork.chainId]?.[address])
  const transactions = pool?.transactions
  const [error, setError] = useState(false)
  const { dataClient } = useClients()[0]

  const previousPriceLength = usePrevious(prices.length)

  useEffect(() => {
    async function fetch() {
      const { error, data } = await fetchPoolTransactions(address, dataClient, activeNetwork.chainId, prices)
      if (error) {
        setError(true)
      } else if (data) {
        dispatch(updatePoolTransactions({ poolAddress: address, transactions: data, networkId: activeNetwork.chainId }))
      }
    }
    if (previousPriceLength !== prices.length && !transactions && !error) {
      fetch()
    }
  }, [address, dispatch, error, transactions, dataClient, activeNetwork.chainId, prices])

  // return data
  return transactions
}

export function usePoolTickData(
  address: string
): [PoolTickData | undefined, (poolAddress: string, tickData: PoolTickData) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const pool = useSelector((state: AppState) => state.pools.byAddress[activeNetwork.chainId]?.[address])
  const tickData = pool.tickData

  const setPoolTickData = useCallback(
    (address: string, tickData: PoolTickData) =>
      dispatch(updateTickData({ poolAddress: address, tickData, networkId: activeNetwork.chainId })),
    [activeNetwork.chainId, dispatch]
  )

  return [tickData, setPoolTickData]
}
export function useHourlyRateData(
  poolAddress: string,
  timeWindow: TimeframeOptions,
  frequency: number
): [PoolRatesEntry[], PoolRatesEntry[]] | undefined {
  const dispatch = useDispatch<AppDispatch>()
  const activeNetwork = useActiveNetworks()[0]
  const ratesData = useSelector(
    (state: AppState) => state.pools.byAddress[activeNetwork.chainId]?.[poolAddress]?.ratesData?.[timeWindow]
  )
  const { dataClient } = useClients()[0]
  const { syncedBlock: latestBlock } = useFetchedSubgraphStatus()

  useEffect(() => {
    const currentTime = dayjs.utc()
    let startTime: number

    switch (timeWindow) {
      case TimeframeOptions.FOUR_HOURS:
        startTime = currentTime.subtract(4, 'hour').startOf('second').unix()
        break
      case TimeframeOptions.ONE_DAY:
        startTime = currentTime.subtract(1, 'day').startOf('minute').unix()
        break
      case TimeframeOptions.THERE_DAYS:
        startTime = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
      case TimeframeOptions.WEEK:
        startTime = currentTime.subtract(1, 'week').startOf('hour').unix()
        break
      case TimeframeOptions.MONTH:
        startTime = currentTime.subtract(1, 'month').startOf('hour').unix()
        break
      default:
        startTime = currentTime.subtract(3, 'day').startOf('hour').unix()
        break
    }

    async function fetch() {
      const ratesData = await getHourlyRateData(
        dataClient,
        poolAddress,
        startTime,
        latestBlock,
        frequency,
        activeNetwork
      )
      ratesData &&
        dispatch(updatePoolRatesData({ poolAddress, ratesData, timeWindow, networkId: activeNetwork.chainId }))
    }
    if (!ratesData) {
      fetch()
    }
  }, [timeWindow, poolAddress, latestBlock, frequency, dataClient, ratesData, activeNetwork, dispatch])

  return ratesData
}
