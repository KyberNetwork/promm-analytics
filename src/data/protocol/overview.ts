import { get2DayChange, getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { getDeltaTimestamps } from 'utils/queries'
import { getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'

const GLOBAL_DATA = (block?: string | number): import('graphql').DocumentNode => {
  const queryString = ` query KyberSwapFactories {
      factories(
       ${block !== undefined ? `block: { number: ${block}}` : ``}
       first: 1, subgraphError: allow) {
        txCount
        totalVolumeUSD
        totalFeesUSD
        totalValueLockedUSD
      }
    }`
  return gql(queryString)
}

export interface Factory {
  txCount: string | number
  totalVolumeUSD: string | number
  totalFeesUSD: string | number
  totalValueLockedUSD: string | number
}
interface GlobalResponse {
  factories: Factory[]
}

const formatValue = (value: string | number | undefined): string | undefined =>
  typeof value === 'number' ? value.toString() : value

export function calcProtocolData(params: Factory[]): ProtocolData {
  const [parsed, parsed24, parsed48, parsedWeek, parsed2Week] = params

  // volume data
  const [volumeUSD, volumeUSDChange] = get2DayChange(
    parsed?.totalVolumeUSD,
    parsed24?.totalVolumeUSD,
    parsed48?.totalVolumeUSD
  )
  const [volumeUSDWeek, volumeUSDChangeWeek] = get2DayChange(
    parsed?.totalVolumeUSD,
    parsedWeek?.totalVolumeUSD,
    parsed2Week?.totalVolumeUSD
  )
  // total value locked
  const tvlUSDChange = getPercentChange(
    formatValue(parsed?.totalValueLockedUSD),
    formatValue(parsed24?.totalValueLockedUSD)
  )

  // 24H transactions
  const [txCount, txCountChange] = get2DayChange(parsed?.txCount, parsed24?.txCount, parsed48?.txCount)

  const feesOneWindowAgo =
    parsed24 && parsed48 ? parseFloat(parsed24?.totalFeesUSD + '') - parseFloat(parsed48?.totalFeesUSD + '') : undefined

  const feesUSD =
    parsed && parsed24
      ? parseFloat(parsed?.totalFeesUSD + '') - parseFloat(parsed24?.totalFeesUSD + '')
      : parseFloat(parsed?.totalFeesUSD + '')

  const feeChange = feesUSD && feesOneWindowAgo ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString()) : 0

  return {
    volumeUSD,
    volumeUSDChange,
    volumeUSDWeek,
    volumeUSDChangeWeek,
    tvlUSD: parseFloat(parsed?.totalValueLockedUSD + ''),
    tvlUSDChange,
    feesUSD,
    feeChange,
    txCount,
    txCountChange,
  }
}

export async function fetchProtocolData(
  activeDataClient: ApolloClient<NormalizedCacheObject>,
  activeBlockClient: ApolloClient<NormalizedCacheObject>
): Promise<Factory[]> {
  // get blocks from historic timestamps
  const blocks = await getBlocksFromTimestamps(getDeltaTimestamps(), activeBlockClient)

  const [block24, block48, blockWeek, block2Weeks] = blocks ?? []

  // fetch all data
  const inputs = [
    undefined,
    block24?.number ?? 0,
    block48?.number ?? 0,
    blockWeek?.number ?? 0,
    block2Weeks?.number ?? 0,
  ]
  const response = await Promise.allSettled(
    inputs.map((val) =>
      activeDataClient.query({
        query: GLOBAL_DATA(val),
        fetchPolicy: 'cache-first',
      })
    )
  )
  const params = response
    .map((e: PromiseSettledResult<any>) => (e.status === 'fulfilled' ? e.value.data : ({} as GlobalResponse)))
    .map((e) => e?.factories?.[0])
  return params
}
