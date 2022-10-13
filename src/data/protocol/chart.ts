import { ChartDayData } from '../../types/index'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId, NETWORKS_INFO_MAP } from 'constants/networks'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const GLOBAL_CHART = gql`
  query KyberSwapDayDatas($startTime: Int!, $skip: Int!) {
    kyberSwapDayDatas(
      first: 1000
      skip: $skip
      subgraphError: allow
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      volumeUSD
      tvlUSD
    }
  }
`

interface ChartResults {
  kyberSwapDayDatas: {
    date: number
    volumeUSD: string
    tvlUSD: string
  }[]
}

export async function fetchChartData(client: ApolloClient<NormalizedCacheObject>): Promise<ChartDayData[]> {
  let data: {
    date: number
    volumeUSD: string
    tvlUSD: string
  }[] = []
  const startTimestamp = client === NETWORKS_INFO_MAP[ChainId.ARBITRUM].client ? 1630423606 : 1619136000
  const endTimestamp = dayjs.utc().unix()

  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const { data: chartResData, error, loading } = await client.query<ChartResults>({
        query: GLOBAL_CHART,
        variables: {
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.kyberSwapDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.kyberSwapDayDatas)
        }
      }
    }
  } catch {}
  if (!data.length) return []
  const formattedExisting = data.reduce((accum: { [date: number]: ChartDayData }, dayData) => {
    const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
    accum[roundedDate] = {
      date: dayData.date,
      volumeUSD: parseFloat(dayData.volumeUSD),
      tvlUSD: parseFloat(dayData.tvlUSD),
    }
    return accum
  }, {})

  const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

  // fill in empty days ( there will be no day datas if no trades made that day )
  let timestamp = firstEntry?.date ?? startTimestamp
  let latestTvl = firstEntry?.tvlUSD ?? 0
  while (timestamp < endTimestamp - ONE_DAY_UNIX) {
    const nextDay = timestamp + ONE_DAY_UNIX
    const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
    if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
      formattedExisting[currentDayIndex] = {
        date: nextDay,
        volumeUSD: 0,
        tvlUSD: latestTvl,
      }
    } else {
      latestTvl = formattedExisting[currentDayIndex].tvlUSD
    }
    timestamp = nextDay
  }

  return Object.values(formattedExisting)
}
