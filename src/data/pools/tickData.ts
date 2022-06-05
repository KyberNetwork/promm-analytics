import gql from 'graphql-tag'
import JSBI from 'jsbi'
import keyBy from 'lodash.keyby'
import { TickMath, tickToPrice } from '@vutien/dmm-v3-sdk'
import { Token } from '@uniswap/sdk-core'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

const PRICE_FIXED_DIGITS = 4
const DEFAULT_SURROUNDING_TICKS = 300

const FEE_TIER_TO_TICK_SPACING = (feeTier: string): number => {
  switch (feeTier) {
    case '1000':
      return 200
    case '300':
      return 60
    case '40':
      return 8
    case '10':
      return 1
    case '8':
      return 1
    default:
      throw Error(`Tick spacing for fee tier ${feeTier} undefined.`)
  }
}

interface TickPool {
  tick: string
  feeTier: string
  token0: {
    symbol: string
    id: string
    decimals: string
  }
  token1: {
    symbol: string
    id: string
    decimals: string
  }
  sqrtPrice: string
  liquidity: string
}

interface PoolResult {
  pool: TickPool
}

// Raw tick returned from GQL
interface Tick {
  tickIdx: string
  liquidityGross: string
  liquidityNet: string
  price0: string
  price1: string
}

interface SurroundingTicksResult {
  ticks: Tick[]
}

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  liquidityGross: JSBI
  liquidityNet: JSBI
  tickIdx: number
  liquidityActive: JSBI
  price0: string
  price1: string
}

const fetchInitializedTicks = async (
  poolAddress: string,
  tickIdxLowerBound: number,
  tickIdxUpperBound: number,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{ loading?: boolean; error?: boolean; ticks?: Tick[] }> => {
  const tickQuery = gql`
    query surroundingTicks(
      $poolAddress: String!
      $tickIdxLowerBound: BigInt!
      $tickIdxUpperBound: BigInt!
      $skip: Int!
    ) {
      ticks(
        subgraphError: allow
        first: 1000
        skip: $skip
        where: { poolAddress: $poolAddress, tickIdx_lte: $tickIdxUpperBound, tickIdx_gte: $tickIdxLowerBound }
      ) {
        tickIdx
        liquidityGross
        liquidityNet
        price0
        price1
      }
    }
  `

  let surroundingTicks: Tick[] = []
  let surroundingTicksResult: Tick[] = []
  let skip = 0

  do {
    const { data, error, loading } = await client.query<SurroundingTicksResult>({
      query: tickQuery,
      fetchPolicy: 'cache-first',
      variables: {
        poolAddress,
        tickIdxLowerBound,
        tickIdxUpperBound,
        skip,
      },
    })

    // console.log({ data, error, loading }, 'Result. Skip: ' + skip)

    if (loading) {
      continue
    }

    if (error) {
      return { error: Boolean(error), loading, ticks: surroundingTicksResult }
    }

    surroundingTicks = data.ticks
    surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks)
    skip += 1000
  } while (surroundingTicks.length > 0)

  return { ticks: surroundingTicksResult, loading: false, error: false }
}

export interface PoolTickData {
  ticksProcessed: TickProcessed[]
  feeTier: string
  tickSpacing: number
  activeTickIdx: number
}

const poolQuery = gql`
  query pool($poolAddress: String!) {
    pool(id: $poolAddress) {
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      feeTier
      sqrtPrice
      liquidity
    }
  }
`

const cacheCompute: { [poolAddress_currentTickIdx: string]: TickProcessed } = {}

export const fetchTicksSurroundingPrice = async (
  poolAddress: string,
  client: ApolloClient<NormalizedCacheObject>,
  numSurroundingTicks = DEFAULT_SURROUNDING_TICKS
): Promise<{
  loading?: boolean
  error?: boolean
  data?: PoolTickData
}> => {
  const { data: poolResult, error, loading } = await client.query<PoolResult>({
    query: poolQuery,
    variables: {
      poolAddress,
    },
  })

  if (loading || error || !poolResult) {
    return {
      loading,
      error: Boolean(error),
      data: undefined,
    }
  }

  const {
    pool: {
      tick: poolCurrentTick,
      feeTier,
      liquidity,
      token0: { id: token0Address, decimals: token0Decimals },
      token1: { id: token1Address, decimals: token1Decimals },
    },
  } = poolResult

  // TODO: check this code, why current tick is null
  // namgold: checked and dont found null case
  // if (!poolCurrentTick) {
  //   debugger
  // }
  const poolCurrentTickIdx = parseInt(poolCurrentTick || '0')
  const tickSpacing = FEE_TIER_TO_TICK_SPACING(feeTier)

  // The pools current tick isn't necessarily a tick that can actually be initialized.
  // Find the nearest valid tick given the tick spacing.
  const activeTickIdx = Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing

  // Our search bounds must take into account fee spacing. i.e. for fee tier 1%, only
  // ticks with index 200, 400, 600, etc can be active.
  const tickIdxLowerBound = activeTickIdx - numSurroundingTicks * tickSpacing
  const tickIdxUpperBound = activeTickIdx + numSurroundingTicks * tickSpacing

  const initializedTicksResult = await fetchInitializedTicks(poolAddress, tickIdxLowerBound, tickIdxUpperBound, client)
  if (initializedTicksResult.error || initializedTicksResult.loading) {
    return {
      error: initializedTicksResult.error,
      loading: initializedTicksResult.loading,
    }
  }

  const { ticks: initializedTicks } = initializedTicksResult

  const tickIdxToInitializedTick = keyBy(initializedTicks, 'tickIdx')

  const token0 = new Token(1, token0Address, parseInt(token0Decimals))
  const token1 = new Token(1, token1Address, parseInt(token1Decimals))

  // If the pool's tick is MIN_TICK (-887272), then when we find the closest
  // initializable tick to its left, the value would be smaller than MIN_TICK.
  // In this case we must ensure that the prices shown never go below/above.
  // what actual possible from the protocol.
  let activeTickIdxForPrice = activeTickIdx
  if (activeTickIdxForPrice < TickMath.MIN_TICK) {
    activeTickIdxForPrice = TickMath.MIN_TICK
  }
  if (activeTickIdxForPrice > TickMath.MAX_TICK) {
    activeTickIdxForPrice = TickMath.MAX_TICK
  }

  const activeTickProcessed: TickProcessed = {
    liquidityActive: JSBI.BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: JSBI.BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(PRICE_FIXED_DIGITS),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(PRICE_FIXED_DIGITS),
    liquidityGross: JSBI.BigInt(0),
  }

  // If our active tick happens to be initialized (i.e. there is a position that starts or
  // ends at that tick), ensure we set the gross and net.
  // correctly.
  const activeTick = tickIdxToInitializedTick[activeTickIdx]
  if (activeTick) {
    activeTickProcessed.liquidityGross = JSBI.BigInt(activeTick.liquidityGross)
    activeTickProcessed.liquidityNet = JSBI.BigInt(activeTick.liquidityNet)
  }

  enum Direction {
    ASC,
    DESC,
  }

  // Computes the numSurroundingTicks above or below the active tick.
  const computeSurroundingTicks = async (
    activeTickProcessed: TickProcessed,
    tickSpacing: number,
    numSurroundingTicks: number,
    direction: Direction
  ) => {
    let previousTickProcessed: TickProcessed = {
      ...activeTickProcessed,
    }

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks: TickProcessed[] = []

    const compute = async (i: number) => {
      if (i >= numSurroundingTicks) return
      const currentTickIdx =
        direction == Direction.ASC
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing

      if (currentTickIdx < TickMath.MIN_TICK || currentTickIdx > TickMath.MAX_TICK) {
        return
      }
      let result: TickProcessed | undefined
      const key = poolAddress + '_' + currentTickIdx
      if (cacheCompute[key]) result = cacheCompute[key]
      else {
        const currentTickProcessed: TickProcessed = {
          liquidityActive: previousTickProcessed.liquidityActive,
          tickIdx: currentTickIdx,
          liquidityNet: JSBI.BigInt(0),
          price0: tickToPrice(token0, token1, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
          price1: tickToPrice(token1, token0, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
          liquidityGross: JSBI.BigInt(0),
        }

        // Check if there is an initialized tick at our current tick.
        // If so copy the gross and net liquidity from the initialized tick.
        const currentInitializedTick = tickIdxToInitializedTick[currentTickIdx.toString()]
        if (currentInitializedTick) {
          currentTickProcessed.liquidityGross = JSBI.BigInt(currentInitializedTick.liquidityGross)
          currentTickProcessed.liquidityNet = JSBI.BigInt(currentInitializedTick.liquidityNet)
        }

        // Update the active liquidity.
        // If we are iterating ascending and we found an initialized tick we immediately apply
        // it to the current processed tick we are building.
        // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
        if (direction == Direction.ASC && currentInitializedTick) {
          currentTickProcessed.liquidityActive = JSBI.add(
            previousTickProcessed.liquidityActive,
            JSBI.BigInt(currentInitializedTick.liquidityNet)
          )
        } else if (direction == Direction.DESC && JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))) {
          // We are iterating descending, so look at the previous tick and apply any net liquidity.
          currentTickProcessed.liquidityActive = JSBI.subtract(
            previousTickProcessed.liquidityActive,
            previousTickProcessed.liquidityNet
          )
        }
        result = currentTickProcessed
      }

      processedTicks.push(result)
      previousTickProcessed = result
      cacheCompute[key] = result
      compute(i + 1)
    }
    await compute(0)

    if (direction == Direction.DESC) {
      processedTicks = processedTicks.reverse()
    }

    return processedTicks
  }

  const subsequentTicks: TickProcessed[] = await computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.ASC
  )

  const previousTicks: TickProcessed[] = await computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.DESC
  )

  const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

  return {
    data: {
      ticksProcessed,
      feeTier,
      tickSpacing,
      activeTickIdx,
    },
  }
}
