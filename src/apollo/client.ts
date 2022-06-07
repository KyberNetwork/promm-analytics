import { ApolloClient, InMemoryCache } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'

export const healthClient = new ApolloClient({
  uri: 'https://api.thegraph.com/index-node/graphql',
  cache: new InMemoryCache(),
})

export const createClient = (url: string): ApolloClient<NormalizedCacheObject> =>
  new ApolloClient({
    uri: url,
    cache: new InMemoryCache({
      typePolicies: {
        Token: {
          // Singleton types that have no identifying field can use an empty
          // array for their keyFields.
          keyFields: false,
        },
        Pool: {
          // Singleton types that have no identifying field can use an empty
          // array for their keyFields.
          keyFields: false,
        },
      },
    }),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  })

export const createBlockClient = (blockUrl: string): ApolloClient<NormalizedCacheObject> =>
  new ApolloClient({
    uri: blockUrl,
    cache: new InMemoryCache(),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
    },
  })
