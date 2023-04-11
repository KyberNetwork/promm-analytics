import { NormalizedCacheObject, ApolloClient } from '@apollo/client'
import gql from 'graphql-tag'

export const TOP_TOKENS = gql`
  query top500Tokens {
    tokens(first: 500, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

export async function getTopTokenAddresses(
  dataClient: ApolloClient<NormalizedCacheObject>,
  signal: AbortSignal
): Promise<string[]> {
  const { data } = await dataClient.query<TopTokensResponse>({
    query: TOP_TOKENS,
    fetchPolicy: 'cache-first',
    context: {
      fetchOptions: {
        signal,
      },
    },
  })
  return data ? data.tokens.map((t) => t.id) : []
}
