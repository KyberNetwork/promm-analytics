import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { useAllPoolData } from 'state/pools/hooks'
import { useMemo } from 'react'
import { notEmpty } from 'utils'
import { TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'
import { calcPosition } from 'utils/position'
import { useEthPrices } from 'hooks/useEthPrices'

export const POSITION_FRAGMENT = gql`
  fragment PositionFragment on Position {
    id
    owner
    liquidity
    pool {
      id
      feeTier
      tick
      liquidity
      reinvestL
      sqrtPrice
    }
    tickLower {
      tickIdx
    }
    tickUpper {
      tickIdx
    }
    token0 {
      id
      symbol
      decimals
      derivedETH
    }
    token1 {
      symbol
      id
      decimals
      derivedETH
    }
  }
`

const USER_POSITIONS = (user: string) => {
  const queryString = gql`
  ${POSITION_FRAGMENT}
  query positions {
    positions(where: {owner: "${user.toLowerCase()}",liquidity_gt: 0}, first: 100) {
      ...PositionFragment
    }
  }
   `
  return queryString
}

export const TOP_POSITIONS = (poolIds: string[]): import('graphql').DocumentNode => {
  let poolStrings = `[`
  poolIds.forEach((id) => {
    poolStrings += `"${id.toLowerCase()}",`
  })
  poolStrings += ']'

  const queryString = `
  query positions {
    positions(where: {pool_in: ${poolStrings}, liquidity_gt: 0}, first: 100) {
      id
      owner
      liquidity
      tickLower {
        tickIdx
      }
      tickUpper {
        tickIdx
      }
      pool {
       id
       feeTier
       tick
       liquidity
       reinvestL
       sqrtPrice
     }
     token0 {
        id
        symbol
        decimals
        derivedETH
      }
      token1 {
        symbol
        id
        decimals
        derivedETH
      }
    }
  }
   `
  return gql(queryString)
}

export interface PositionFields {
  id: string
  owner: string
  liquidity: string
  token0: {
    id: string
    symbol: string
    decimals: string
    derivedETH: string
  }
  token1: {
    id: string
    symbol: string
    decimals: string
    derivedETH: string
  }
  pool: {
    id: string
    feeTier: string
    liquidity: string
    reinvestL: string
    tick: string
    sqrtPrice: string
  }
  tickLower: {
    tickIdx: string
  }
  tickUpper: {
    tickIdx: string
  }
  amountDepositedUSD: string
}

interface PositionDataResponse {
  positions: PositionFields[]
}

/**
 * Fetch top addresses by liquidity
 */
export function useFetchedPositionsDatas(): {
  loading: boolean
  error: boolean
  data: PositionFields[] | undefined
} {
  const { dataClient } = useClients()[0]
  const ethPriceUSD = useEthPrices()
  const activeNetwork = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from tokenData

  const allPoolData = useAllPoolData()

  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
      .map((p) => p.address)
  }, [allPoolData])

  const { loading, error, data } = useQuery<PositionDataResponse>(TOP_POSITIONS(poolDatas), {
    client: dataClient,
  })

  const res = useMemo(() => {
    return data?.positions
      .map((p) => {
        const position = calcPosition({ p, chainId: activeNetwork.chainId, ethPriceUSD: ethPriceUSD?.current })

        return {
          ...p,
          amountDepositedUSD: position.userPositionUSD,
        }
      })
      .sort((a, b) => b.amountDepositedUSD - a.amountDepositedUSD)
  }, [data, ethPriceUSD?.current, activeNetwork?.chainId])

  return {
    loading: loading,
    error: !!error,
    data: res as any,
  }
}

export function useFetchedUserPositionData(
  address: string
): {
  loading: boolean
  error?: boolean
  data?: PositionFields[]
} {
  const { dataClient } = useClients()[0]
  const { loading, error, data } = useQuery<PositionDataResponse>(USER_POSITIONS(address), {
    client: dataClient,
  })

  return {
    loading: loading,
    error: !!error,
    data: data?.positions,
  }
}

const GLOBAL_TRANSACTIONS = gql`
  query transactions($address: Bytes!) {
    mints(first: 500, orderBy: timestamp, orderDirection: desc, where: { origin: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    swaps(first: 500, orderBy: timestamp, orderDirection: desc, where: { origin: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
    burns(first: 500, orderBy: timestamp, orderDirection: desc, where: { origin: $address }, subgraphError: allow) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      origin
      amount0
      amount1
      amountUSD
    }
  }
`

export function useUserTransactions(
  address: string
): {
  loading: boolean
  error: boolean
  data: any[]
} {
  const { dataClient } = useClients()[0]

  const { loading, error, data } = useQuery(GLOBAL_TRANSACTIONS, {
    client: dataClient,
    variables: {
      address: address.toLowerCase(),
    },
    fetchPolicy: 'cache-first',
  })

  const mints = data?.mints.map((m: any) => {
    return {
      type: TransactionType.MINT,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })
  const burns = data?.burns.map((m: any) => {
    return {
      type: TransactionType.BURN,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })

  const swaps = data?.swaps.map((m: any) => {
    return {
      type: TransactionType.SWAP,
      hash: m.transaction.id,
      timestamp: m.timestamp,
      sender: m.origin,
      token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
      token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
      token0Address: m.pool.token0.id,
      token1Address: m.pool.token1.id,
      amountUSD: parseFloat(m.amountUSD),
      amountToken0: parseFloat(m.amount0),
      amountToken1: parseFloat(m.amount1),
    }
  })

  return {
    loading: loading,
    error: !!error,
    data: [...(mints || []), ...(burns || []), ...(swaps || [])],
  }
}
