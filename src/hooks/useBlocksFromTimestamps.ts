import gql from 'graphql-tag'
import { useState, useEffect, useMemo } from 'react'
import { splitQuery } from 'utils/queries'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

export const GET_BLOCKS = (timestamps: string[]): import('graphql').DocumentNode => {
  let queryString = 'query blocks {'
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

/**
 * for a given array of timestamps, returns block entities
 * @param timestamps
 */
export function useBlocksFromTimestamps(
  timestamps: number[],
  blockClientOverride?: ApolloClient<NormalizedCacheObject>
): {
  blocks: Block[] | undefined
  error: boolean
} {
  const activeNetwork = useActiveNetworks()[0]
  const [blocks, setBlocks] = useState<any>()
  const [error, setError] = useState(false)

  const { blockClient } = useClients()[0]
  const activeBlockClient = blockClientOverride ?? blockClient

  // derive blocks based on active network
  const networkBlocks = blocks?.[activeNetwork.chainId]

  useEffect(() => {
    async function fetchData() {
      const results = await splitQuery(GET_BLOCKS, activeBlockClient, [], timestamps)
      if (results) {
        setBlocks({ ...(blocks ?? {}), [activeNetwork.chainId]: results })
      } else {
        setError(true)
      }
    }
    if (!networkBlocks && !error) {
      fetchData()
    }
  })

  const blocksFormatted = useMemo(() => {
    if (blocks?.[activeNetwork.chainId]) {
      const networkBlocks = blocks?.[activeNetwork.chainId]
      const formatted = []
      for (const t in networkBlocks) {
        if (networkBlocks[t].length > 0) {
          formatted.push({
            timestamp: t.split('t')[1],
            number: parseInt(networkBlocks[t][0]['number']),
          })
        }
      }
      return formatted
    }
    return undefined
  }, [activeNetwork.chainId, blocks])

  return {
    blocks: blocksFormatted,
    error,
  }
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(
  timestamps: number[],
  blockClient: ApolloClient<NormalizedCacheObject>,
  skipCount = 500
): Promise<Block[]> {
  if (timestamps?.length === 0) {
    return []
  }
  const fetchedData: any = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)

  const blocks: Block[] = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: parseInt(fetchedData[t][0]['number']),
        })
      }
    }
  }
  return blocks
}
