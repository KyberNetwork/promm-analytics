import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'

import { getDeltaTimestamps } from 'utils/queries'
import { getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange } from 'utils/data'
import { formatTokenName, formatTokenSymbol } from 'utils/tokens'
import { FEE_BASE_UNITS } from 'utils'
import { NetworkInfo } from 'constants/networks'
import { fetchTopPoolAddresses } from './topPools'
import { AbortedError } from 'constants/index'
import { fetchPoolsDataV2 } from './poolDataV2'

export const POOLS_BULK = (block: number | string | undefined, pools: string[]): import('graphql').DocumentNode => {
  let poolString = `[`
  pools.map((address) => {
    return (poolString += `"${address.toLowerCase()}",`)
  })
  poolString += ']'
  const queryString =
    `
    query poolsByAddressesAtBlock {
      pools(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow, first: 500) {
        id
        feeTier
        liquidity
        reinvestL
        sqrtPrice
        tick
        token0 {
            id
            symbol
            name
            decimals
            derivedETH
        }
        token1 {
            id
            symbol
            name
            decimals
            derivedETH
        }
        token0Price
        token1Price
        volumeUSD
        txCount
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
        volumeToken0
        volumeToken1
      }
    }
    `
  return gql(queryString)
}

interface PoolFields {
  id: string
  feeTier: string
  liquidity: string
  reinvestL: string
  sqrtPrice: string
  tick: string
  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token0Price: string
  token1Price: string
  volumeUSD: string
  txCount: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLockedUSD: string
  volumeToken0: string
  volumeToken1: string
}

interface PoolDataResponse {
  pools: PoolFields[]
}

export async function fetchPoolsData(
  network: NetworkInfo,
  isEnableKNProtocol: boolean,
  client: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
  isEnableBlockService: boolean,
  signal: AbortSignal
): Promise<{
  [address: string]: PoolData
}> {
  if (isEnableKNProtocol) return fetchPoolsDataV2(network, signal)
  return fetchPoolsDataV1(network, client, blockClient, isEnableBlockService, signal)
}

/**
 * Fetch top addresses by volume
 */
export async function fetchPoolsDataV1(
  network: NetworkInfo,
  client: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
  isEnableBlockService: boolean,
  signal: AbortSignal
): Promise<{
  [address: string]: PoolData
}> {
  // get blocks from historic timestamps
  const [poolAddresses, blocks] = await Promise.all([
    fetchTopPoolAddresses(client, signal),
    getBlocksFromTimestamps(isEnableBlockService, getDeltaTimestamps(), blockClient, network.chainId, signal),
  ])

  if (signal.aborted) throw new AbortedError()
  const [block24, block48] = blocks ?? []

  // fetch all data
  const inputs = [undefined, block24?.number ?? 0, block48?.number ?? 0]

  const response = await Promise.allSettled(
    inputs.map((val) =>
      client.query({
        query: POOLS_BULK(val, poolAddresses),
        fetchPolicy: 'cache-first',
      })
    )
  )
  if (signal.aborted) throw new AbortedError()

  const [data, data24, data48] = response.map((e: PromiseSettledResult<any>) =>
    e.status === 'fulfilled' ? e.value.data : ({} as PoolDataResponse)
  )

  const [parsed, parsed24, parsed48] = [data, data24, data48].map((item) => {
    return item?.pools
      ? item.pools.reduce((accum: { [address: string]: PoolFields }, poolData: PoolFields) => {
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}
  })

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24[address]
    const twoDay: PoolFields | undefined = parsed48[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]

    const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0

    const tvlUSDChange =
      current && oneDay
        ? ((parseFloat(current.totalValueLockedUSD) - parseFloat(oneDay.totalValueLockedUSD)) /
            parseFloat(oneDay.totalValueLockedUSD <= '0' ? Infinity.toString() : oneDay.totalValueLockedUSD)) *
          100
        : 0

    const tvlToken0 = current ? parseFloat(current.totalValueLockedToken0) : 0
    const tvlToken1 = current ? parseFloat(current.totalValueLockedToken1) : 0

    const feeTier = current ? parseInt(current.feeTier) : 0

    if (current) {
      accum[address] = {
        address,
        feeTier,
        fee: volumeUSD * (feeTier / FEE_BASE_UNITS),
        liquidity: parseFloat(current.liquidity),
        reinvestL: parseFloat(current.reinvestL),
        sqrtPrice: parseFloat(current.sqrtPrice),
        tick: parseFloat(current.tick),
        token0: {
          address: current.token0.id,
          name: formatTokenName(current.token0.id, current.token0.name, network),
          symbol: formatTokenSymbol(current.token0.id, current.token0.symbol, network),
          decimals: parseInt(current.token0.decimals),
        },
        token1: {
          address: current.token1.id,
          name: formatTokenName(current.token1.id, current.token1.name, network),
          symbol: formatTokenSymbol(current.token1.id, current.token1.symbol, network),
          decimals: parseInt(current.token1.decimals),
        },
        token0Price: parseFloat(current.token0Price),
        token1Price: parseFloat(current.token1Price),
        volumeUSD,
        volumeUSDChange,
        tvlUSD,
        tvlUSDChange,
        tvlToken0,
        tvlToken1,
        apr: tvlUSD > 0 ? (volumeUSD * (feeTier / FEE_BASE_UNITS) * 100 * 365) / tvlUSD : 0,
        chainId: network.chainId,
      }
    }

    return accum
  }, {})

  return formatted
}
