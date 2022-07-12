import { ALL_CHAIN_ID } from 'constants/index'
import { ChainIdType, NET_WORKS_SUPPORTED } from 'constants/networks'
import { useEthPrices } from 'hooks/useEthPrices'
import { useEffect } from 'react'
import { useActiveNetworks, useActiveNetworkUtils, useAppLoading } from 'state/application/hooks'
import { useUpdatePoolData } from 'state/pools/hooks'
import { PoolData } from 'state/pools/reducer'
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { ProtocolData } from 'state/protocol/reducer'
import { useUpdateTokenData } from 'state/tokens/hooks'
import { TokenData } from 'state/tokens/reducer'
import { ChartDayData, Transaction } from 'types'
import { fetchPoolDatas } from './pools/poolData'
import { fetchChartDataV2 } from './protocol/chart'
import { calcProtocolData, Factory, fetchProtocolData } from './protocol/overview'
import { fetchTopTransactions } from './protocol/transactions'
import { fetchedTokenDatas } from './tokens/tokenData'

// todo mới vô bị fetch ether
// todo pool table network lech

function mergeProtocalData(dataAllChain: Factory[], data1Chain: Factory[]) {
  dataAllChain.forEach((elment, i) => {
    const info = data1Chain[i]
    if (!info) return
    const { totalFeesUSD, totalValueLockedUSD, totalVolumeUSD, txCount } = info
    if (totalFeesUSD) {
      elment.totalFeesUSD = +elment.totalFeesUSD + +totalFeesUSD
    }
    if (totalValueLockedUSD) {
      elment.totalValueLockedUSD = +elment.totalValueLockedUSD + +totalValueLockedUSD
    }
    if (totalVolumeUSD) {
      elment.totalVolumeUSD = +elment.totalVolumeUSD + +totalVolumeUSD
    }
    if (txCount) {
      elment.txCount = +elment.txCount + +txCount
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
  if (cacheData[key]) {
    return Promise.resolve(cacheData[key])
  }
  try {
    const data = await callback()
    cacheData[key] = data
    return data
  } catch (error) {
    throw error
  }
}

export function useGlobalData(): Array<any> {
  const ethPrices = useEthPrices()
  const activeNetworks = useActiveNetworks()
  const networks = activeNetworks.filter(
    (e) => NET_WORKS_SUPPORTED.find((el: ChainIdType) => el == e.chainId) && e.chainId.toString() != ALL_CHAIN_ID
  )

  const { isAllChain, chainId, networkInfo } = useActiveNetworkUtils()
  const [loading, setLoading] = useAppLoading()

  const getDataByNetwork = (result: { [chainId: string]: any }) => {
    if (loading) setLoading(false) // off loading when at least one data finished
    if (isAllChain) return result[ALL_CHAIN_ID]
    return result[networkInfo.chainId]
  }

  async function fetchProtocalData() {
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
      mergeProtocalData(allData, info)
      results[networks[index].chainId] = calcProtocolData(info)
    })

    results[ALL_CHAIN_ID] = calcProtocolData(allData)
    return results
  }

  async function fetchAllTokens() {
    const promises = networks.map((net) =>
      memoRequest(KeysCaches.TOKEN + net.chainId, () => fetchedTokenDatas(net, ethPrices))
    )
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
      memoRequest(KeysCaches.CHART + net.chainId, () => fetchChartDataV2(net.client) as Promise<ChartDayData[]>)
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
    const promises = networks.map((net) => memoRequest(KeysCaches.POOL + net.chainId, () => fetchPoolDatas(net)))
    const response = await Promise.allSettled(promises)
    const data = response.map((data) => (data.status === 'fulfilled' ? data.value : {}))
    const result: { [chainId: string]: { [address: string]: PoolData } } = {}
    const resultAllChain: { [address: string]: PoolData } = {}
    data.forEach((poolData, i) => {
      result[networks[i].chainId] = poolData
      // data for all chain
      Object.keys(poolData).forEach((address) => {
        if (resultAllChain[address]) console.error('Dupplicate !!!!')
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
  const updateTokenDatas = useUpdateTokenData()

  useEffect(() => {
    fetchProtocalData()
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
  }, [chainId])

  useEffect(() => {
    if (ethPrices) {
      fetchAllTokens()
        .then((data) => {
          updateTokenDatas(getDataByNetwork(data))
        })
        .catch(console.error)
    }
  }, [ethPrices, chainId])

  return []
}
