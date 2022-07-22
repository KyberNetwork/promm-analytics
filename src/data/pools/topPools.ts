import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'

const TOP_POOLS = gql`
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
export async function fetchTopPoolAddresses(dataClient: ApolloClient<NormalizedCacheObject>): Promise<string[]> {
  const { data } = await dataClient.query<TopPoolsResponse>({ query: TOP_POOLS, fetchPolicy: 'cache-first' })
  return data ? data.pools.map((p) => p.id) : []
}
