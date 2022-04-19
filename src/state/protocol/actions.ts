import { ProtocolData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { ChartDayData, Transaction } from 'types'
import { ChainId } from 'constants/networks'

// protocol wide info
export const updateProtocolData = createAction<{ protocolData: ProtocolData; networkId: ChainId }>(
  'protocol/updateProtocolData'
)
export const updateChartData = createAction<{ chartData: ChartDayData[]; networkId: ChainId }>(
  'protocol/updateChartData'
)
export const updateTransactions = createAction<{ transactions: Transaction[]; networkId: ChainId }>(
  'protocol/updateTransactions'
)
