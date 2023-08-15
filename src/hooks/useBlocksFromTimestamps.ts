import { NETWORKS_INFO_MAP } from './../constants/networks'
import gql from 'graphql-tag'
import { splitQuery } from 'utils/queries'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from 'constants/networks'
import { BLOCK_SERVICE_API } from 'constants/env'
import { chunk } from 'utils/array'
import { AbortedError } from 'constants/index'

const GET_BLOCKS = (timestamps: number[]): import('graphql').DocumentNode => {
  let queryString = 'query blocksByTimestamps {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
        number
      }`
  })
  queryString += '}'
  return gql(queryString)
}

export type Block = {
  timestamp: string
  number: number
}

type BlockRawResult = {
  timestamp: string
  number: string
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestampsSubgraph(
  timestamps: number[],
  blockClient: ApolloClient<NormalizedCacheObject>,
  signal?: AbortSignal
): Promise<Block[]> {
  if (timestamps?.length === 0 || !blockClient) {
    return []
  }
  const fetchedData = await splitQuery<BlockRawResult[], number, unknown>(
    GET_BLOCKS,
    blockClient,
    timestamps,
    [],
    500,
    signal
  )
  if (signal?.aborted) throw new AbortedError()

  const blocks: Block[] = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t]?.length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: parseInt(fetchedData[t][0].number),
        } as Block)
      }
    }
  }

  return blocks
}

export async function getBlocksFromTimestampsBlockService(
  timestamps: number[],
  chainId: ChainId,
  signal?: AbortSignal
): Promise<Block[]> {
  if (timestamps?.length === 0) {
    return []
  }
  const allChunkResult = (
    await Promise.all(
      chunk(timestamps, 50).map(
        async (timestampsChunk) =>
          (
            await fetch(
              `${BLOCK_SERVICE_API}/${
                NETWORKS_INFO_MAP[chainId].blockServiceRoute
              }/api/v1/block?timestamps=${timestampsChunk.join(',')}`,
              { signal }
            )
          ).json() as Promise<{ data: Block[] }>
      )
    )
  )
    .map((chunk) => chunk.data)
    .flat()
  if (signal?.aborted) throw new AbortedError()

  return allChunkResult
}

export async function getBlocksFromTimestamps(
  isEnableBlockService: boolean,
  timestamps: number[],
  blockClient: ApolloClient<NormalizedCacheObject>,
  chainId: ChainId,
  signal: AbortSignal
): Promise<Block[]> {
  if (isEnableBlockService) return getBlocksFromTimestampsBlockService(timestamps, chainId, signal)
  return getBlocksFromTimestampsSubgraph(timestamps, blockClient, signal)
}
