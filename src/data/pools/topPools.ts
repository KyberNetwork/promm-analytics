import { useMemo } from 'react'
import { ApolloClient, NormalizedCacheObject, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useClients } from 'state/application/hooks'

export const TOP_POOLS = gql`
  query topPools {
    pools(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`

interface TopPoolsResponse {
  pools: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopPoolAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()[0]
  const { loading, error, data } = useQuery<TopPoolsResponse>(TOP_POOLS, {
    client: dataClient,
    fetchPolicy: 'cache-first',
  })

  const formattedData = useMemo(() => {
    if (data) {
      return data.pools.map((p) => p.id)
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}

/**
 * Fetch top addresses by volume
 */
export async function fetchTopPoolAddresses(dataClient: ApolloClient<NormalizedCacheObject>): Promise<string[]> {
  const { data } = await dataClient.query<TopPoolsResponse>({ query: TOP_POOLS, fetchPolicy: 'cache-first' })
  if (data) {
    return data.pools.map((p) => p.id)
  } else {
    return []
  }
}
