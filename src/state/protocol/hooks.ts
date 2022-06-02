import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { AppState, AppDispatch } from './../index'
import { ProtocolData } from './reducer'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChartDayData, Transaction } from 'types'
import { useActiveNetworks } from 'state/application/hooks'
import { useFetchAggregateProtocolData } from 'data/protocol/overview'

export function useProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const activeNetwork = useActiveNetworks()[0]
  const protocolData: ProtocolData | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.chainId]?.data
  )

  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (protocolData: ProtocolData) => void = useCallback(
    (protocolData: ProtocolData) => dispatch(updateProtocolData({ protocolData, networkId: activeNetwork.chainId })),
    [activeNetwork.chainId, dispatch]
  )
  return [protocolData, setProtocolData]
}

export function useProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
  const activeNetwork = useActiveNetworks()[0]
  const chartData: ChartDayData[] | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.chainId]?.chartData
  )

  const dispatch = useDispatch<AppDispatch>()
  const setChartData: (chartData: ChartDayData[]) => void = useCallback(
    (chartData: ChartDayData[]) => dispatch(updateChartData({ chartData, networkId: activeNetwork.chainId })),
    [activeNetwork.chainId, dispatch]
  )
  return [chartData, setChartData]
}

export function useProtocolTransactions(): [Transaction[] | undefined, (transactions: Transaction[]) => void] {
  const activeNetwork = useActiveNetworks()[0]
  const transactions: Transaction[] | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.chainId]?.transactions
  )
  const dispatch = useDispatch<AppDispatch>()
  const setTransactions: (transactions: Transaction[]) => void = useCallback(
    (transactions: Transaction[]) => dispatch(updateTransactions({ transactions, networkId: activeNetwork.chainId })),
    [activeNetwork.chainId, dispatch]
  )
  return [transactions, setTransactions]
}

export function useAggregateOverviewData() {
  useFetchAggregateProtocolData()
}
