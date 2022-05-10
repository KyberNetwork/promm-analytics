import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import gql from 'graphql-tag'
import { getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'

export const PRICES_BY_BLOCK = (blocks: any) => {
  const queryString = `query bundles {
    ${blocks.map(
      (block: any) => `
        b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }, subgraphError: allow) {
          ethPriceUSD
        }
      `
    )}
  }`
  return gql(queryString)
}

type PriceBlockResults = {
  [key: string]: {
    ethPriceUSD: string
  }
}

export default async function getETHPriceFromTimestamps(
  timestamps: number[],
  dataClient: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>
): Promise<{ [timestamp: number]: number }> {
  try {
    const blocks = await getBlocksFromTimestamps(timestamps, blockClient, 500)
    if (blocks && blocks.length) {
      const { data, error } = await dataClient.query<PriceBlockResults>({
        query: PRICES_BY_BLOCK(blocks),
        fetchPolicy: 'cache-first',
      })
      if (error) throw error
      const result: { [timestamp: number]: number } = {}
      timestamps.forEach((timestamp) => (result[timestamp] = parseFloat(data['b' + timestamp].ethPriceUSD)))
      return result
    } else throw new Error('Cant query block client')
  } catch (e) {
    throw e
  }

  return [1]
}
