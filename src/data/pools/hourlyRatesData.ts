import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { PoolRatesEntry } from 'state/pools/reducer'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { NetworkInfo } from 'constants/networks'
import { Block, getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { splitQuery } from 'utils/queries'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)

const HOURLY_POOL_RATES = (blocks: Block[], poolAddress: string): import('graphql').DocumentNode => {
  let queryString = 'query poolRates {'
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}: pool(id:"${poolAddress.toLowerCase()}", block: { number: ${block.number} }) {
        token0Price
        token1Price
      }
    `
  )

  queryString += '}'
  return gql(queryString)
}

interface ChartResults {
  token0Price: string
  token1Price: string
}

export const getHourlyRateData = async (
  client: ApolloClient<NormalizedCacheObject>,
  poolAddress: string,
  startTime: number,
  latestBlock: number | undefined,
  frequency: number,
  networksInfo: NetworkInfo
): Promise<[PoolRatesEntry[], PoolRatesEntry[]] | undefined> => {
  try {
    const utcEndTime = dayjs.utc()
    let time = startTime

    // create an array of hour start times until we reach current hour
    const timestamps = []
    while (time <= utcEndTime.unix() - frequency) {
      timestamps.push(time)
      time += frequency
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks

    blocks = await getBlocksFromTimestamps(timestamps, networksInfo.blockClient)

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return b.number <= latestBlock
      })
    }

    const result = await splitQuery<ChartResults, Block, string>(HOURLY_POOL_RATES, client, blocks, [poolAddress], 100)

    // format token ETH price results
    const values: {
      timestamp: number
      rate0: number
      rate1: number
    }[] = []
    for (const row in result) {
      const timestamp = parseFloat(row.split('t')[1])
      if (timestamp && result[row]) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price),
        })
      }
    }

    const formattedHistoryRate0: PoolRatesEntry[] = []
    const formattedHistoryRate1: PoolRatesEntry[] = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistoryRate0.push({
        time: values[i].timestamp,
        open: values[i].rate0,
        close: values[i + 1].rate0,
      })
      formattedHistoryRate1.push({
        time: values[i].timestamp,
        open: values[i].rate1,
        close: values[i + 1].rate1,
      })
    }

    return [formattedHistoryRate0, formattedHistoryRate1]
  } catch (e) {
    console.log(e)
    return
  }
}
