import { POOL_FARM_BASE_URL } from 'constants/env'
import { NetworkInfo } from 'constants/networks'
import { PoolData } from 'state/pools/reducer'

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
  feesUsdOneDayAgo: string
  volumeUsdOneDayAgo: string

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
    await fetch(
      `${POOL_FARM_BASE_URL}/${network.poolFarmRoute}/api/v1/elastic/pools?includeLowTvl=true&page=1&perPage=10000`,
      { signal }
    )
  ).json()

  const poolData: {
    [address: string]: PoolData
  } =
    data?.data?.pools.reduce(
      (acc, pool) => {
        acc[pool.id] = {
          address: pool.id,
          feeTier: Number(pool.feeTier),
          fee: Number(pool.feesUsd),

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

          volumeUSD: Number(pool.volumeUsd) - Number(pool.volumeUsdOneDayAgo),
          // volumeUSDChange: pool.volumeUSDChange,
          // volumeOneDayToken0: pool.volumeOneDayToken0,
          // volumeOneDayToken1: pool.volumeOneDayToken1,
          volumeUSDChange: 0,
          volumeOneDayToken0: 0,
          volumeOneDayToken1: 0,

          tvlUSD: Number(pool.totalValueLockedUsd),
          tvlUSDChange: 0,

          token0Price: 0,
          token1Price: 0,

          // tvlToken0: pool.tvlToken0,
          // tvlToken1: pool.tvlToken1,
          tvlToken0: 0,
          tvlToken1: 0,
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
