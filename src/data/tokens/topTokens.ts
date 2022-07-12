import { useMemo } from 'react'
import { NormalizedCacheObject, useQuery, ApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import { useClients } from 'state/application/hooks'

export const TOP_TOKENS = gql`
  query topPools {
    tokens(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()[0]

  const { loading, error, data } = useQuery<TopTokensResponse>(TOP_TOKENS, { client: dataClient })

  const formattedData = useMemo(() => {
    if (data) {
      return data.tokens.map((t) => t.id)
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

export async function getTopTokenAddresses(dataClient: ApolloClient<NormalizedCacheObject>): Promise<string[]> {
  const { data } = await dataClient.query<TopTokensResponse>({
    query: TOP_TOKENS,
    fetchPolicy: 'cache-first',
  })
  if (data) {
    return data.tokens.map((t) => t.id)
  } else {
    return []
  }
}
