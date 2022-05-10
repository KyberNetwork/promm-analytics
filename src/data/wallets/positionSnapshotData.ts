import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { POSITION_FRAGMENT, PositionFields } from './walletData'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { useEffect, useState } from 'react'
import { ChainId } from 'constants/networks'
import dayjs from 'dayjs'
import getETHPriceFromTimestamps from 'data/tokens/ethPriceHistoryData'
import { calcPosition } from 'utils/position'

export const POSITION_SNAPSHOT = gql`
  ${POSITION_FRAGMENT}
  query snapshots($owner: Bytes!, $skip: Int!) {
    positionSnapshots(orderBy: blockNumber, orderDirection: desc, first: 1000, skip: $skip, where: { owner: $owner }) {
      position {
        ...PositionFragment
      }
      timestamp
    }
  }
`

export interface PositionSnapshotFields extends PositionFields {
  timestamp: string
}

interface UserSnapshotResults {
  positionSnapshots: {
    position: PositionFields
    timestamp: string
  }[]
}

export async function fetchPositionSnapshots(
  address: string,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{
  loading: boolean
  error: boolean
  data: PositionSnapshotFields[] | undefined
}> {
  try {
    let skip = 0
    let allResults: PositionSnapshotFields[] = []
    let found = false
    while (!found) {
      const {
        data: { positionSnapshots: data },
        error,
        loading,
      } = await client.query<UserSnapshotResults>({
        query: POSITION_SNAPSHOT,
        variables: {
          skip,
          owner: address,
        },
        fetchPolicy: 'network-only',
      })
      if (!loading) {
        skip += 1000

        if (data.length < 1000 || error) {
          found = true
        }
        if (data) {
          allResults = allResults.concat(
            data.map((snapshot) => ({
              ...snapshot.position,
              timestamp: snapshot.timestamp,
            }))
          )
        }
      }
    }

    return {
      data: allResults,
      error: false,
      loading: false,
    }
  } catch (e) {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }
}

export function useUserSnapshots(address: string) {
  const activeNetwork = useActiveNetworks()[0]
  const { dataClient } = useClients()[0]

  const [snapshots, setSnapshots] = useState<{ [key in ChainId]?: PositionSnapshotFields[] }>()
  const [error, setError] = useState(false)

  //todo namgold continue this

  useEffect(() => {
    async function fetchData() {
      try {
        const { error, data } = await fetchPositionSnapshots(address, dataClient)
        if (error) {
          setError(true)
        } else if (data) {
          setSnapshots({ ...(snapshots ?? {}), [activeNetwork.chainId]: data })
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!snapshots && address && !error) {
      fetchData()
    }
  }, [activeNetwork.chainId, address, dataClient, error, snapshots])

  return snapshots
}

type AllPoolChartData = {
  date: number
  valueUSD: number
}

export type AllPoolChartDatas = AllPoolChartData[]

export enum TimeframeOptions {
  FOUR_HOURS = '4 hours',
  ONE_DAY = '1 day',
  THERE_DAYS = '3 days',
  WEEK = '1 week',
  MONTH = '1 month',
  THREE_MONTHS = '3 months',
  YEAR = '1 year',
  ALL_TIME = 'All time',
}

export function useTimeframe(): [TimeframeOptions, React.Dispatch<React.SetStateAction<TimeframeOptions>>] {
  const [timeWindow, setTimeWindow] = useState(TimeframeOptions.ALL_TIME)
  return [timeWindow, setTimeWindow]
}

export function useAllPoolChartData(account: string): AllPoolChartDatas | null {
  const { dataClient, blockClient } = useClients()[0]
  const snapshots = useUserSnapshots(account)
  const activeNetwork = useActiveNetworks()[0]
  // formatetd array to return for chart data
  const [formattedHistory, setFormattedHistory] = useState<AllPoolChartDatas | null>(null)

  const [startDateTimestamp, setStartDateTimestamp] = useState<number>(Date.now())
  const [activeWindow] = useTimeframe()

  // monitor the old date fetched
  useEffect(() => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (activeWindow) {
      case TimeframeOptions.WEEK:
        utcStartTime = utcEndTime.subtract(1, 'week').startOf('day')
        break
      case TimeframeOptions.ALL_TIME:
        utcStartTime = utcEndTime.subtract(1, 'year')
        break
      default:
        utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        break
    }
    const startTime = utcStartTime.unix() - 1
    if ((activeWindow && startTime < startDateTimestamp) || !startDateTimestamp) {
      setStartDateTimestamp(startTime)
    }
  }, [activeWindow, startDateTimestamp])

  useEffect(() => {
    async function fetchData() {
      const currentSnapshot = snapshots?.[activeNetwork.chainId]
      if (!currentSnapshot || !currentSnapshot.length) return
      let dayIndex = startDateTimestamp / 86400 // get unique day bucket unix
      const currentDayIndex = dayjs.utc().unix() / 86400

      // sort snapshots in order
      const sortedPositions = currentSnapshot.sort((a, b) => (parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1))
      // if UI start time is > first position time - bump start index to this time
      if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
        dayIndex = Math.floor(parseInt(sortedPositions[0].timestamp) / 86400)
      }

      const dayTimestamps = []
      // get date timestamps for all days in view
      while (dayIndex < currentDayIndex) {
        dayTimestamps.push(dayIndex * 86400)
        dayIndex = dayIndex + 1
      }
      const snapshotMappedByTimestamp: { [key: number]: PositionSnapshotFields[] } = {}
      dayTimestamps.forEach((dayTimestamp) => (snapshotMappedByTimestamp[dayTimestamp] = []))
      currentSnapshot.forEach((snapshot) => {
        const index = Math.floor(parseInt(snapshot.timestamp) / 86400) * 86400
        if (snapshotMappedByTimestamp[index]) snapshotMappedByTimestamp[index].push(snapshot)
        else {
          snapshotMappedByTimestamp[index] = [snapshot]
          console.warn('namgold: something wrong here. This if branch should not be execute.')
        }
      })
      const ethPrices = await getETHPriceFromTimestamps(dayTimestamps, dataClient, blockClient)

      // map of current pair => ownership %
      const latestDataForPairs: { [positionId: string]: PositionSnapshotFields | undefined } = {}
      const formattedHistory = dayTimestamps.map((dayTimestamp) => {
        if (dayTimestamp === 1652140800) {
          debugger
        }
        // cycle through relevant positions and update ownership for any that we need to
        const relevantPositions = snapshotMappedByTimestamp[dayTimestamp]
        relevantPositions.forEach((currentPosition) => {
          // case where pair not added yet
          if (
            !latestDataForPairs[currentPosition.id] ||
            parseInt(latestDataForPairs[currentPosition.id]!.timestamp) < parseInt(currentPosition.timestamp)
          ) {
            latestDataForPairs[currentPosition.id] = currentPosition
          }
        })
        let totalUSD = 0

        Object.keys(latestDataForPairs).forEach((positionId) => {
          let usdValue = 0
          if (latestDataForPairs[positionId]) {
            const positionValues = calcPosition({
              p: latestDataForPairs[positionId]!,
              chainId: activeNetwork.chainId,
              ethPriceUSD: ethPrices[dayTimestamp],
            })
            usdValue = positionValues.userPositionUSD
          }

          totalUSD += usdValue
        })

        return {
          date: dayTimestamp,
          valueUSD: totalUSD,
        }
      })

      setFormattedHistory(formattedHistory)
    }
    if (startDateTimestamp && (snapshots?.[activeNetwork.chainId]?.length || 0) > 0) {
      fetchData()
    }
  }, [snapshots, startDateTimestamp, activeNetwork.chainId, blockClient, dataClient])

  return formattedHistory
}

type PoolChartData = {
  date: number
  usdValue: number
  fees: number
}

export type PoolChartDatas = PoolChartData[]

export function usePoolChartData(account: string, positionID: string): PoolChartDatas | null {
  const { dataClient, blockClient } = useClients()[0]
  const snapshots = useUserSnapshots(account)
  const activeNetwork = useActiveNetworks()[0]
  // formatetd array to return for chart data
  const [formattedHistory, setFormattedHistory] = useState<PoolChartDatas | null>(null)

  const [startDateTimestamp, setStartDateTimestamp] = useState<number>(Date.now())
  const [activeWindow] = useTimeframe()

  useEffect(() => {
    setFormattedHistory(null)
  }, [account, positionID])

  // monitor the old date fetched
  useEffect(() => {
    const utcEndTime = dayjs.utc()
    // based on window, get starttime
    let utcStartTime
    switch (activeWindow) {
      case TimeframeOptions.WEEK:
        utcStartTime = utcEndTime.subtract(1, 'week').startOf('day')
        break
      case TimeframeOptions.ALL_TIME:
        utcStartTime = utcEndTime.subtract(1, 'year')
        break
      default:
        utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        break
    }
    const startTime = utcStartTime.unix() - 1
    if ((activeWindow && startTime < startDateTimestamp) || !startDateTimestamp) {
      setStartDateTimestamp(startTime)
    }
  }, [activeWindow, startDateTimestamp])

  useEffect(() => {
    async function fetchData() {
      const currentSnapshot = snapshots?.[activeNetwork.chainId]?.filter((snapshot) => snapshot.id === positionID)
      if (!currentSnapshot || !currentSnapshot.length) return
      let dayIndex = startDateTimestamp / 86400 // get unique day bucket unix
      const currentDayIndex = dayjs.utc().unix() / 86400

      // sort snapshots in order
      const sortedPositions = currentSnapshot.sort((a, b) => (parseInt(a.timestamp) > parseInt(b.timestamp) ? 1 : -1))
      // if UI start time is > first position time - bump start index to this time
      if (parseInt(sortedPositions[0].timestamp) > dayIndex) {
        dayIndex = Math.floor(parseInt(sortedPositions[0].timestamp) / 86400)
      }

      const dayTimestamps = []
      // get date timestamps for all days in view
      while (dayIndex < currentDayIndex) {
        dayTimestamps.push(dayIndex * 86400)
        dayIndex = dayIndex + 1
      }
      const snapshotMappedByTimestamp: { [key: number]: PositionSnapshotFields[] | undefined } = {}
      dayTimestamps.forEach((dayTimestamp) => (snapshotMappedByTimestamp[dayTimestamp] = []))
      currentSnapshot.forEach((snapshot) => {
        const index = Math.floor(parseInt(snapshot.timestamp) / 86400) * 86400
        if (snapshotMappedByTimestamp[index]) snapshotMappedByTimestamp[index]!.push(snapshot)
        else {
          snapshotMappedByTimestamp[index] = [snapshot]
          console.warn('namgold: something wrong here. This if branch should not be execute.')
        }
      })
      const ethPrices = await getETHPriceFromTimestamps(dayTimestamps, dataClient, blockClient)

      // map of current pair => ownership %
      let latestDataForPairs: PositionSnapshotFields | undefined
      const formattedHistory = dayTimestamps.map((dayTimestamp) => {
        if (dayTimestamp === 1652140800) {
          debugger
        }
        // cycle through relevant positions and update ownership for any that we need to
        const relevantPositions = snapshotMappedByTimestamp[dayTimestamp]
        relevantPositions?.forEach((currentPosition) => {
          // case where pair not added yet
          if (!latestDataForPairs || parseInt(latestDataForPairs.timestamp) < parseInt(currentPosition.timestamp)) {
            latestDataForPairs = currentPosition
          }
        })
        let usdValue = 0
        if (latestDataForPairs) {
          const positionValues = calcPosition({
            p: latestDataForPairs,
            chainId: activeNetwork.chainId,
            ethPriceUSD: ethPrices[dayTimestamp],
          })
          usdValue = positionValues.userPositionUSD
        }

        return {
          date: dayTimestamp,
          usdValue,
          fees: 0,
        }
      })

      setFormattedHistory(formattedHistory)
    }
    if (startDateTimestamp && (snapshots?.[activeNetwork.chainId]?.length || 0) > 0) {
      fetchData()
    }
  }, [snapshots, startDateTimestamp, activeNetwork.chainId, blockClient, dataClient, positionID])

  return formattedHistory
}
