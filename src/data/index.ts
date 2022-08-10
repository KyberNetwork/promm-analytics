import { ALL_CHAIN_ID } from 'constants/index'
import { ChainIdType, ELASTIC_SUPPORTED_NETWORKS } from 'constants/networks'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
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
const cacheData: { [key: string]: any } = {}
const memoRequest = async (key: string, callback: () => Promise<any>) => {
  try {
    if (cacheData[key]) {
      return await cacheData[key]
    }
    cacheData[key] = callback()
    return await cacheData[key]
  } catch (error) {
    throw error
  }
}

export function useGlobalData(): Array<any> {
  const activeNetworks = useActiveNetworks()
  const { isAllChain, chainId, networkInfo } = useActiveNetworkUtils()

  const networks = !ELASTIC_SUPPORTED_NETWORKS.includes(chainId)
    ? activeNetworks.filter((e) => e.chainId === chainId) // chain not in menu
    : activeNetworks.filter(
        (e) =>
          ELASTIC_SUPPORTED_NETWORKS.find((el: ChainIdType) => el == e.chainId) && e.chainId.toString() != ALL_CHAIN_ID
      )

  const getDataByNetwork = (result: { [chainId: string]: any }) => {
    if (isAllChain) return result[ALL_CHAIN_ID]
    return result[networkInfo.chainId]
  }

  async function fetchAllProtocolData() {
    const promises = networks.map((net) =>
      memoRequest(KeysCaches.PROTOCOL + net.chainId, () => fetchProtocolData(net.client, net.blockClient))
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
  }

  async function fetchAllTokens() {
    const promises = networks.map((net) => memoRequest(KeysCaches.TOKEN + net.chainId, () => fetchedTokenData(net)))
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

  async function fetchAllChartData() {
    const promises = networks.map((net) =>
      memoRequest(KeysCaches.CHART + net.chainId, () => fetchChartData(net.client) as Promise<ChartDayData[]>)
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
  }

  async function fetchAllPoolData() {
    const promises = networks.map((net) => memoRequest(KeysCaches.POOL + net.chainId, () => fetchPoolsData(net)))
    const response = await Promise.allSettled(promises)
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
  }

  async function fetchAllTransactionData() {
    const promises = networks.map((net) =>
      memoRequest(KeysCaches.TRANSACTION + net.chainId, () => fetchTopTransactions(net))
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
  }

  const updateProtocolData = useProtocolData()[1]
  const updateChartData = useProtocolChartData()[1]
  const updateTransactions = useProtocolTransactions()[1]
  const updatePoolData = useUpdatePoolData()
  const updateTokenData = useUpdateTokenData()
  const { isAppInit } = useSelector((state: AppState) => state.application)

  useEffect(() => {
    if (!isAppInit) return
    fetchAllProtocolData()
      .then((data) => {
        updateProtocolData(getDataByNetwork(data))
      })
      .catch(console.error)

    fetchAllChartData()
      .then((data) => {
        updateChartData(getDataByNetwork(data))
      })
      .catch(console.error)

    fetchAllPoolData()
      .then((data) => {
        updatePoolData(Object.values(getDataByNetwork(data)))
      })
      .catch(console.error)

    fetchAllTransactionData()
      .then((data) => {
        updateTransactions(getDataByNetwork(data))
      })
      .catch(console.error)
  }, [isAppInit, chainId])

  useEffect(() => {
    if (!isAppInit) return
    fetchAllTokens()
      .then((data) => {
        updateTokenData(getDataByNetwork(data))
      })
      .catch(console.error)
  }, [isAppInit, chainId])

  return []
}
