import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'

const TOP_POOLS = gql`
  query top500PoolsTVL {
    pools(first: 500, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
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
export async function fetchTopPoolAddresses(
  dataClient: ApolloClient<NormalizedCacheObject>,
  signal: AbortSignal
): Promise<string[]> {
  const { data } = await dataClient.query<TopPoolsResponse>({
    query: TOP_POOLS,
    fetchPolicy: 'cache-first',
    context: {
      fetchOptions: {
        signal,
      },
    },
  })
  return data ? data.pools.map((p) => p.id) : []
}
