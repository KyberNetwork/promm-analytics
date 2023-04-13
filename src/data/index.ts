import { AbortedError, ALL_CHAIN_ID } from 'constants/index'
import { ChainIdType, ELASTIC_SUPPORTED_NETWORKS } from 'constants/networks'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
import { setWhitelistToken } from 'state/tokens/actions'
import { fetchAllWhitelistToken, useWhitelistTokenByChain } from 'state/tokens/hooks'
import { useUpdatePoolData } from 'state/pools/hooks'
import { PoolData } from 'state/pools/reducer'
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { ProtocolData } from 'state/protocol/reducer'
import { useUpdateTokenData } from 'state/tokens/hooks'
import { TokenData } from 'state/tokens/reducer'
import { ChartDayData, Transaction } from 'types'
import { fetchPoolsData } from './pools/poolData'
import { fetchChartData } from './protocol/chart'
import { calcProtocolData, Factory, fetchProtocolData } from './protocol/overview'
import { fetchTopTransactions } from './protocol/transactions'
import { fetchedTokenData } from './tokens/tokenData'
import { useKyberswapConfig } from 'hooks/useKyberSwapConfig'
import { promiseWithSignal } from 'utils'

function mergeProtocolData(dataAllChain: Factory[], data1Chain: Factory[]) {
  dataAllChain.forEach((element, i) => {
    const info = data1Chain[i]
    if (!info) return
    const { totalFeesUSD, totalValueLockedUSD, totalVolumeUSD, txCount } = info
    if (totalFeesUSD) {
      element.totalFeesUSD = +element.totalFeesUSD + +totalFeesUSD
    }
    if (totalValueLockedUSD) {
      element.totalValueLockedUSD = +element.totalValueLockedUSD + +totalValueLockedUSD
    }
    if (totalVolumeUSD) {
      element.totalVolumeUSD = +element.totalVolumeUSD + +totalVolumeUSD
    }
    if (txCount) {
      element.txCount = +element.txCount + +txCount
    }
  })
  return dataAllChain
}

const KeysCaches = {
  PROTOCOL: 'PROTOCOL',
  CHART: 'CHART',
  TOKEN: 'TOKEN',
  POOL: 'POOL',
  TRANSACTION: 'TRANSACTION',
}
const cacheData: { [key: string]: Promise<any> | undefined } = {}
const memoRequest = async (key: string, callback: () => Promise<any>, signal?: AbortSignal) => {
  try {
    let cacheValue = cacheData[key] || callback()
    try {
      const result = await promiseWithSignal(cacheValue, signal)
      if (!signal?.aborted) {
        return result
      }
    } catch {
      // do nothing, calculate new value.
    }
    if (signal?.aborted) throw new AbortedError()
    cacheValue = callback()
    const result = await promiseWithSignal(cacheValue, signal)
    if (signal?.aborted) throw new AbortedError()
    return result
  } catch (error) {
    throw error
  }
}

export function useGlobalData(): Array<any> {
  const activeNetworks = useActiveNetworks()
  const kyberswapConfig = useKyberswapConfig()
  const { isAllChain, chainId, networkInfo } = useActiveNetworkUtils()

  const networks = useMemo(
    () =>
      !ELASTIC_SUPPORTED_NETWORKS.includes(chainId)
        ? activeNetworks.filter((e) => e.chainId === chainId) // chain not in menu
        : activeNetworks.filter(
            (e) =>
              ELASTIC_SUPPORTED_NETWORKS.find((el: ChainIdType) => el == e.chainId) &&
              e.chainId.toString() != ALL_CHAIN_ID
          ),
    [activeNetworks, chainId]
  )

  const [, updateProtocolData] = useProtocolData()
  const [, updateChartData] = useProtocolChartData()
  const [, updateTransactions] = useProtocolTransactions()
  const updatePoolData = useUpdatePoolData()
  const updateTokenData = useUpdateTokenData()
  const { isAppInit } = useSelector((state: AppState) => state.application)

  const getDataByNetwork = useCallback(
    (result: { [chainId: string]: any }) => {
      if (isAllChain) return result[ALL_CHAIN_ID]
      return result[networkInfo.chainId]
    },
    [isAllChain, networkInfo.chainId]
  )

  const fetchAllProtocolData = useCallback(
    async function (signal: AbortSignal) {
      const promises = networks.map((net) =>
        memoRequest(
          KeysCaches.PROTOCOL + net.chainId,
          () =>
            fetchProtocolData(
              kyberswapConfig[net.chainId].client,
              kyberswapConfig[net.chainId].blockClient,
              kyberswapConfig[net.chainId].isEnableBlockService,
              net.chainId,
              signal
            ),
          signal
        )
      )

      const data = await Promise.allSettled(promises)
      const results: { [key: string]: ProtocolData } = {}

      const allData: Factory[] = Array.from({ length: 4 }, () => ({
        totalFeesUSD: 0,
        totalValueLockedUSD: 0,
        totalVolumeUSD: 0,
        txCount: 0,
      }))

      data.forEach((el, index) => {
        const info = el.status === 'fulfilled' ? el.value : []
        mergeProtocolData(allData, info)
        results[networks[index].chainId] = calcProtocolData(info)
      })

      results[ALL_CHAIN_ID] = calcProtocolData(allData)
      return results
    },
    [kyberswapConfig, networks]
  )
  useEffect(() => {
    if (!isAppInit) return
    const abortController = new AbortController()
    fetchAllProtocolData(abortController.signal)
      .then((data) => {
        !abortController.signal.aborted && updateProtocolData(getDataByNetwork(data))
      })
      .catch(console.error)
    return () => abortController.abort()
  }, [fetchAllProtocolData, getDataByNetwork, isAppInit, updateProtocolData])

  const fetchAllChartData = useCallback(
    async function (signal: AbortSignal) {
      const promises = networks.map((net) =>
        memoRequest(
          KeysCaches.CHART + net.chainId,
          () => fetchChartData(net.chainId, kyberswapConfig[net.chainId].client, signal) as Promise<ChartDayData[]>,
          signal
        )
      )
      const response = await Promise.allSettled(promises)
      const data = response.map((data) => (data.status === 'fulfilled' ? data.value : []))
      const result: { [chainId: string]: ChartDayData[] } = {}
      const resultAllChain: { [key: number]: ChartDayData } = {}
      data.forEach((chartData, i) => {
        result[networks[i].chainId] = chartData || []
        // data for all chain
        if (chartData) {
          chartData.forEach((dayData: ChartDayData) => {
            const { date, tvlUSD, volumeUSD } = dayData
            if (!resultAllChain[date]) resultAllChain[date] = { ...dayData }
            else {
              // add data
              resultAllChain[date].tvlUSD += tvlUSD
              resultAllChain[date].volumeUSD += volumeUSD
            }
          })
        }
      })
      result[ALL_CHAIN_ID] = Object.values(resultAllChain)
      return result
    },
    [kyberswapConfig, networks]
  )
  useEffect(() => {
    if (!isAppInit) return
    const abortController = new AbortController()
    fetchAllChartData(abortController.signal)
      .then((data) => {
        !abortController.signal.aborted && updateChartData(getDataByNetwork(data))
      })
      .catch(console.error)
    return () => abortController.abort()
  }, [fetchAllChartData, getDataByNetwork, isAppInit, updateChartData])

  const fetchAllPoolData = useCallback(
    async function (signal: AbortSignal) {
      const promises = networks.map((net) =>
        memoRequest(
          KeysCaches.POOL + net.chainId,
          () =>
            fetchPoolsData(
              net,
              kyberswapConfig[net.chainId].client,
              kyberswapConfig[net.chainId].blockClient,
              kyberswapConfig[net.chainId].isEnableBlockService,
              signal
            ),
          signal
        )
      )
      const response = await Promise.allSettled(promises)
      if (signal.aborted) throw new AbortedError()
      const data = response.map((data) => (data.status === 'fulfilled' ? data.value : {}))
      const result: { [chainId: string]: { [address: string]: PoolData } } = {}
      const resultAllChain: { [address: string]: PoolData } = {}
      data.forEach((poolData, i) => {
        result[networks[i].chainId] = poolData
        // data for all chain
        Object.keys(poolData).forEach((address) => {
          if (resultAllChain[address]) console.error('Duplicate !!!!')
          resultAllChain[address] = poolData[address]
        })
      })
      result[ALL_CHAIN_ID] = resultAllChain
      return result
    },
    [kyberswapConfig, networks]
  )
  useEffect(() => {
    if (!isAppInit) return
    const abortController = new AbortController()
    fetchAllPoolData(abortController.signal)
      .then((data) => {
        !abortController.signal.aborted && updatePoolData(Object.values(getDataByNetwork(data)))
      })
      .catch(console.error)
    return () => abortController.abort()
  }, [fetchAllPoolData, getDataByNetwork, isAppInit, updatePoolData])

  const fetchAllTransactionData = useCallback(
    async function (signal: AbortSignal) {
      const promises = networks.map((net) =>
        memoRequest(
          KeysCaches.TRANSACTION + net.chainId,
          () => fetchTopTransactions(net, kyberswapConfig[net.chainId].client, signal),
          signal
        )
      )
      const data = await Promise.allSettled(promises)
      const results: { [key: string]: Transaction[] } = {}
      let dataAllChain: Transaction[] = []
      data.forEach((el, index) => {
        const info = el.status === 'fulfilled' ? el.value || [] : []
        results[networks[index].chainId] = info
        dataAllChain = dataAllChain.concat(info)
      })
      results[ALL_CHAIN_ID] = dataAllChain
      return results
    },
    [kyberswapConfig, networks]
  )

  useEffect(() => {
    if (!isAppInit) return
    const abortController = new AbortController()
    fetchAllTransactionData(abortController.signal)
      .then((data) => {
        !abortController.signal.aborted && updateTransactions(getDataByNetwork(data))
      })
      .catch(console.error)
    return () => abortController.abort()
  }, [fetchAllTransactionData, getDataByNetwork, isAppInit, updateTransactions])

  const dispatch = useAppDispatch()
  const whitelistTokenMap = useWhitelistTokenByChain()

  useEffect(() => {
    async function fetchAllTokens(signal: AbortSignal) {
      const promises = networks.map((net) => {
        return memoRequest(
          KeysCaches.TOKEN + net.chainId,
          () => {
            return fetchedTokenData(
              net,
              kyberswapConfig[net.chainId].client,
              kyberswapConfig[net.chainId].blockClient,
              kyberswapConfig[net.chainId].isEnableBlockService,
              net.chainId,
              signal
            )
          },
          signal
        )
      })
      const response = await Promise.allSettled(promises)
      const result: { [chainId: string]: TokenData[] } = {}
      let resultAllChain: TokenData[] = []
      response.map((e, i) => {
        const data = e.status === 'fulfilled' ? e.value : []
        result[networks[i].chainId] = data || []
        resultAllChain = resultAllChain.concat(data || []) // data for all chain
      })
      result[ALL_CHAIN_ID] = resultAllChain
      return result
    }

    if (!isAppInit) return
    const abortController = new AbortController()
    Promise.allSettled([
      Object.keys(whitelistTokenMap).length ? Promise.resolve() : fetchAllWhitelistToken(abortController.signal),
      fetchAllTokens(abortController.signal),
    ])
      .then((data) => {
        if (abortController.signal.aborted) return
        if (data[0].status === 'fulfilled' && data[0].value) dispatch(setWhitelistToken(data[0].value)) // call once, but before fetchAllTokens
        if (data[1].status === 'fulfilled') updateTokenData(getDataByNetwork(data[1].value))
      })
      .catch(console.error)
    return () => {
      abortController.abort()
    }
  }, [isAppInit, chainId, dispatch, whitelistTokenMap, updateTokenData, getDataByNetwork, networks, kyberswapConfig])

  return []
}
