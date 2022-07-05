import { ALL_CHAIN_ID } from 'constants/index'
import { ChainId, NETWORKS_INFO_MAP } from 'constants/networks'
import { useEthPrices } from 'hooks/useEthPrices'
import { useEffect } from 'react'
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
import { useUpdatePoolData } from 'state/pools/hooks'
import { PoolData } from 'state/pools/reducer'
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { ProtocolData } from 'state/protocol/reducer'
import { useUpdateTokenData } from 'state/tokens/hooks'
import { TokenData } from 'state/tokens/reducer'
import { ChartDayData, Transaction } from 'types'
import { fetchPoolDatas } from './pools/poolData'
import { fetchChartData } from './protocol/chart'
import { calcProtocolData, Factory, fetchProtocolData } from './protocol/overview'
import { fetchTopTransactions } from './protocol/transactions'
import { fetchedTokenDatas } from './tokens/tokenData'
// todo danh cache/memo if possible
// todo danh rename factory
// todo danh factory number | string => tranh sai so
// todo danh check interval, change net
// todo replace allChain text
// todo logic logo url
// todo change network mấy filed chưa đúng
// todo resposive các bảng. algin icon netwỏk cac bảng

function mergeData(dataAllChain: Factory[], data1Chain: Factory[]) {
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

const cacheData = {}
// function requestWithCache(function:any, key:string) {}

export function useGlobalData() {
  const ethPrices = useEthPrices()
  const networks = Object.values(NETWORKS_INFO_MAP).filter((e) => e.chainId !== ChainId.AURORA) // todo 1 or n

  const activeNetworks = useActiveNetworks()

  const { isAllChain } = useActiveNetworkUtils()

  const getDataByNetwork = (result: { [chainId: string]: any }) => {
    if (isAllChain) return result[ALL_CHAIN_ID]
    else return result[activeNetworks[0].chainId]
  }

  async function fetchProtocalData() {
    const promises = networks.map((net) => fetchProtocolData(net.client, net.blockClient))
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
      mergeData(allData, info)
      results[networks[index].chainId] = calcProtocolData(info)
    })

    // tesst
    //   const list = Object.values(results)
    //   console.log(
    //     list.map((e) => e.volumeUSDWeek || 0).reduce((a, b) => a + b, 0),
    //     list.map((e) => e.txCount || 0).reduce((a, b) => a + b)
    //   )
    results[ALL_CHAIN_ID] = calcProtocolData(allData)
    return results
  }

  async function fetchAllTokens() {
    const promises = networks.map((net) => fetchedTokenDatas(net, ethPrices))
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
    const promises = networks.map((net) => fetchChartData(net.client))
    const response = await Promise.allSettled(promises)
    const data = response.map((data) => (data.status === 'fulfilled' ? data.value.data : []))
    const result: { [chainId: string]: ChartDayData[] } = {}
    const resultAllChain: { [key: number]: ChartDayData } = {}
    data.forEach((chartData, i) => {
      result[networks[i].chainId] = chartData || []
      // data for all chain
      if (chartData) {
        chartData.forEach((dayData) => {
          const { date, tvlUSD, volumeUSD } = dayData
          if (!resultAllChain[date]) resultAllChain[date] = dayData
          else {
            // add data
            resultAllChain[date].tvlUSD += tvlUSD
            resultAllChain[date].volumeUSD += volumeUSD
          }
        })
      }
    })
    result[ALL_CHAIN_ID] = Object.values(resultAllChain)
    //test
    // Object.values(result).forEach((el) => {
    //   const getTime = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
    //   console.log(el.map((e) => getTime(new Date(e.date * 1000))))
    // })
    return result
  }

  async function fetchAllPoolData() {
    const promises = networks.map((net) => fetchPoolDatas(net))
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
    //test
    // Object.values(result).forEach((el) => {
    //   const getTime = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
    //   console.log(el.map((e) => getTime(new Date(e.date * 1000))))
    // })
    return result
  }

  async function fetchAllTransactionData() {
    const promises = networks.map((net) => fetchTopTransactions(net))
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

  const [protocolData, updateProtocolData] = useProtocolData()
  const [chartData, updateChartData] = useProtocolChartData()
  const [transactions, updateTransactions] = useProtocolTransactions()
  const updatePoolData = useUpdatePoolData()
  const updateTokenDatas = useUpdateTokenData()

  useEffect(() => {
    fetchProtocalData().then((data) => {
      updateProtocolData(getDataByNetwork(data))
    })
    fetchAllChartData().then((data) => {
      updateChartData(getDataByNetwork(data))
    })
    fetchAllPoolData().then((data) => {
      updatePoolData(Object.values(getDataByNetwork(data)))
    })
    fetchAllTransactionData().then((data) => {
      updateTransactions(getDataByNetwork(data))
    })
  }, [activeNetworks]) // todo dependenci

  useEffect(() => {
    if (ethPrices)
      fetchAllTokens().then((data) => {
        updateTokenDatas(getDataByNetwork(data))
      })
  }, [ethPrices, activeNetworks]) // todo dependenci

  return []
}
