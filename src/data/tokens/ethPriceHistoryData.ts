import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ChainId } from 'constants/networks'
import gql from 'graphql-tag'
import { Block, getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'

const PRICES_BY_BLOCK = (blocks: Block[]): import('graphql').DocumentNode => {
  const queryString = `query ethPricesByBlocks {
    ${blocks.map(
      (block) => `
        b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }, subgraphError: allow) {
          ethPriceUSD
        }
      `
    )}
  }`
  return gql(queryString)
}

type PriceBlockResults = {
  [key: string]:
    | {
        ethPriceUSD: string
      }
    | undefined
}

export default async function getETHPriceFromTimestamps(
  timestamps: number[],
  dataClient: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
  isEnableBlockService: boolean,
  chainId: ChainId
): Promise<{ [timestamp: number]: number }> {
  try {
    const blocks = await getBlocksFromTimestamps(isEnableBlockService, timestamps, blockClient, chainId)
    if (blocks && blocks.length) {
      const { data, error } = await dataClient.query<PriceBlockResults>({
        query: PRICES_BY_BLOCK(blocks),
        fetchPolicy: 'cache-first',
      })
      if (error) throw error
      const result: { [timestamp: number]: number } = {}
      timestamps.forEach((timestamp) => (result[timestamp] = parseFloat(data['b' + timestamp]?.ethPriceUSD ?? '0')))
      return result
    } else throw new Error('Cant query block client')
  } catch (e) {
    throw e
  }
}
