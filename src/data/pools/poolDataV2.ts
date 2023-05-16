import JSBI from 'jsbi'
import { Token } from '@kyberswap/ks-sdk-core'
import { Pool } from '@kyberswap/ks-sdk-elastic'
import { POOL_SERVICE } from 'constants/env'
import { NetworkInfo } from 'constants/networks'
import { PoolData } from 'state/pools/reducer'
import { get2DayChange } from 'utils/data'
import { getPercentChange } from 'utils/data'

export type RawToken = {
  id: string
  symbol: string
  name: string
  decimals: string
}

export type ElasticPool = {
  id: string

  token0: RawToken
  token1: RawToken

  feeTier: string
  liquidity: string
  reinvestL: string
  sqrtPrice: string
  tick: string

  volumeUsd: string
  feesUsd: string

  totalValueLockedUsd: string
  totalValueLockedUsdOneDayAgo: string
  feesUsdOneDayAgo: string
  volumeUsdOneDayAgo: string
  feesUsdTwoDayAgo: string
  volumeUsdTwoDayAgo: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string

  totalValueLockedUsdInRange: string
  apr: string
  farmApr: string
}

type Response = {
  code: number
  message: string
  data?: {
    pools: Array<ElasticPool>
  }
}
export async function fetchPoolsDataV2(
  network: NetworkInfo,
  signal: AbortSignal
): Promise<{
  [address: string]: PoolData
}> {
  const data: Response = await (
    await fetch(`${POOL_SERVICE}/${network.poolRoute}/api/v1/elastic/pools?includeLowTvl=true&page=1&perPage=10000`, {
      signal,
    })
  ).json()

  const poolData: {
    [address: string]: PoolData
  } =
    data?.data?.pools.reduce(
      (acc, pool) => {
        const token0 = new Token(network.chainId, pool.token0.id, parseInt(pool.token0.decimals))
        const token1 = new Token(network.chainId, pool.token1.id, parseInt(pool.token1.decimals))
        const sdkPool = new Pool(
          token0,
          token1,
          Number(pool.feeTier),
          JSBI.BigInt(pool.sqrtPrice),
          JSBI.BigInt(pool.liquidity),
          JSBI.BigInt(pool.reinvestL),
          Number(pool.tick)
        )
        const [volumeUSD, volumeUSDChange] = get2DayChange(
          Number(pool.volumeUsd),
          Number(pool.volumeUsdOneDayAgo),
          Number(pool.volumeUsdTwoDayAgo)
        )
        const tvlUSDChange = getPercentChange(pool.totalValueLockedUsd, pool.totalValueLockedUsdOneDayAgo)

        acc[pool.id] = {
          address: pool.id,
          feeTier: Number(pool.feeTier),
          fee: Number(pool.feesUsd) - Number(pool.feesUsdOneDayAgo),

          token0: {
            name: pool.token0.name,
            symbol: pool.token0.symbol,
            address: pool.token0.id,
            decimals: parseInt(pool.token0.decimals),
          },
          token1: {
            address: pool.token1.id,
            name: pool.token1.name,
            symbol: pool.token1.symbol,
            decimals: parseInt(pool.token1.decimals),
          },

          liquidity: Number(pool.liquidity),
          reinvestL: Number(pool.reinvestL),
          sqrtPrice: Number(pool.sqrtPrice),
          tick: Number(pool.tick),

          volumeUSD,
          volumeUSDChange,

          tvlUSD: Number(pool.totalValueLockedUsd),
          tvlUSDChange,

          token0Price: parseFloat(sdkPool.priceOf(token0).toSignificant(30)),
          token1Price: parseFloat(sdkPool.priceOf(token1).toSignificant(30)),

          tvlToken0: Number(pool.totalValueLockedToken0),
          tvlToken1: Number(pool.totalValueLockedToken1),
          apr: Number(pool.apr),

          chainId: network.chainId,
        } as PoolData

        return acc
      },
      {} as {
        [address: string]: PoolData
      }
    ) || {}

  return poolData
}
