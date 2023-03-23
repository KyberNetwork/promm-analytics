import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { Block, getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { PriceChartEntry } from 'types'
import { splitQuery } from 'utils/queries'
import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)

const PRICES_BY_BLOCK = (blocks: Block[], tokenAddress: string): import('graphql').DocumentNode => {
  let queryString = 'query tokenPricesByBlocks {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress.toLowerCase()}", block: { number: ${
      block.number
    } }, subgraphError: allow) {
        derivedETH
      }
    `
  )
  queryString += ','
  queryString += blocks.map(
    (block: any) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }, subgraphError: allow) {
        ethPriceUSD
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

type TokenResult = { derivedETH: string }
type BundleResult = { ethPriceUSD: string }
type PriceByBlockResult = TokenResult | BundleResult

export const getIntervalTokenData = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: number,
  client: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>
): Promise<PriceChartEntry[]> => {
  const utcEndTime = dayjs.utc()
  let time = startTime
  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = []
  while (time < utcEndTime.unix()) {
    timestamps.push(time)
    time += interval
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return []
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks
  try {
    blocks = await getBlocksFromTimestamps(timestamps, blockClient, 200)

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return []
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return b.number <= latestBlock
      })
    }

    const result = await splitQuery<PriceByBlockResult, Block, string>(
      PRICES_BY_BLOCK,
      client,
      blocks,
      [tokenAddress],
      100
    )

    // format token ETH price results
    const values: { timestamp: number; derivedETH: number; priceUSD: number }[] = []
    for (const row in result) {
      if (row[0] === 't') {
        const timestamp = row.split('t')[1]
        if (timestamp && result[row] && result['b' + timestamp]) {
          const derivedETH = parseFloat((result[row] as TokenResult)?.derivedETH)
          const priceUSD = parseFloat((result['b' + timestamp] as BundleResult).ethPriceUSD) * derivedETH
          values.push({
            timestamp: parseInt(timestamp),
            derivedETH,
            priceUSD,
          })
        }
      }
    }

    const formattedHistory: PriceChartEntry[] = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        time: values[i].timestamp,
        open: values[i].priceUSD,
        close: values[i + 1].priceUSD,
      })
    }

    return formattedHistory
  } catch (e) {
    console.log(e)
    console.log('error fetching blocks')
    return []
  }
}
