import { get2DayChange, getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'
import { useClients } from 'state/application/hooks'
import { client, blockClient, arbitrumClient, arbitrumBlockClient } from 'apollo/client'

export const GLOBAL_DATA = (block?: string | number) => {
  const queryString = ` query kyberswapFactories {
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

interface GlobalResponse {
  factories: {
    txCount: string
    totalVolumeUSD: string
    totalFeesUSD: string
    totalValueLockedUSD: string
  }[]
}

export function useFetchProtocolData(
  dataClientOverride?: ApolloClient<NormalizedCacheObject>,
  blockClientOverride?: ApolloClient<NormalizedCacheObject>
): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  // get appropriate clients if override needed
  const { dataClient, blockClient } = useClients()[0]
  const activeDataClient = dataClientOverride ?? dataClient
  const activeBlockClient = blockClientOverride ?? blockClient

  // get blocks from historic timestamps
  const [t24, t48, tWeek, t2Weeks] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek, t2Weeks], activeBlockClient)
  const [block24, block48, blockWeek, block2Weeks] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA(), { client: activeDataClient })

  const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block24?.number ?? 0),
    { client: activeDataClient }
  )

  const { loading: loading48, error: error48, data: data48 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block48?.number ?? 0),
    { client: activeDataClient }
  )

  const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<GlobalResponse>(
    GLOBAL_DATA(blockWeek?.number ?? 0),
    { client: activeDataClient }
  )

  const { loading: loading2Weeks, error: error2Weeks, data: data2Weeks } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block2Weeks?.number ?? 0),
    { client: activeDataClient }
  )

  const anyError = Boolean(error || error24 || error48 || errorWeek || error2Weeks || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek || loading2Weeks)

  const parsed = data?.factories?.[0]
  const parsed24 = data24?.factories?.[0]
  const parsed48 = data48?.factories?.[0]
  const parsedWeek = dataWeek?.factories?.[0]
  const parsed2Week = data2Weeks?.factories?.[0]

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }
    // volume data
    const [volumeUSD, volumeUSDChange] = get2DayChange(
      parsed.totalVolumeUSD,
      parsed24?.totalVolumeUSD,
      parsed48?.totalVolumeUSD
    )
    const [volumeUSDWeek, volumeUSDChangeWeek] = get2DayChange(
      parsed.totalVolumeUSD,
      parsedWeek?.totalVolumeUSD,
      parsed2Week?.totalVolumeUSD
    )
    // total value locked
    const tvlUSDChange = getPercentChange(parsed?.totalValueLockedUSD, parsed24?.totalValueLockedUSD)

    // 24H transactions
    const [txCount, txCountChange] = get2DayChange(parsed.txCount, parsed24?.txCount, parsed48?.txCount)

    const feesOneWindowAgo =
      parsed24 && parsed48 ? parseFloat(parsed24.totalFeesUSD) - parseFloat(parsed48.totalFeesUSD) : undefined

    const feesUSD =
      parsed && parsed24
        ? parseFloat(parsed.totalFeesUSD) - parseFloat(parsed24.totalFeesUSD)
        : parseFloat(parsed.totalFeesUSD)

    const feeChange =
      feesUSD && feesOneWindowAgo ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString()) : 0

    return {
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      volumeUSDChangeWeek,
      tvlUSD: parseFloat(parsed.totalValueLockedUSD),
      tvlUSDChange,
      feesUSD,
      feeChange,
      txCount,
      txCountChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsed2Week, parsed48, parsedWeek])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}

//todo namgold: clear this
export function useFetchAggregateProtocolData(): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  const { data: ethereumData, loading: loadingEthereum, error: errorEthereum } = useFetchProtocolData(
    client,
    blockClient
  )
  const { data: arbitrumData, loading: loadingArbitrum, error: errorArbitrum } = useFetchProtocolData(
    arbitrumClient,
    arbitrumBlockClient
  )

  if (!ethereumData && !arbitrumData) {
    return {
      data: undefined,
      loading: false,
      error: false,
    }
  }

  // for now until useMultipleDatas hook just manuall construct ProtocolData object

  // console.log(ethereumData)
  // console.log(arbitrumData)

  return {
    data: undefined,
    loading: false,
    error: false,
  }
}
