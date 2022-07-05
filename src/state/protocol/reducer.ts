import { currentTimestamp } from './../../utils/index'
import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { ChartDayData, Transaction } from 'types'
import { ChainId } from 'constants/networks'

export interface ProtocolData {
  // volume
  volumeUSD: number
  volumeUSDChange: number

  volumeUSDWeek: number
  volumeUSDChangeWeek: number

  // in range liquidity
  tvlUSD: number
  tvlUSDChange: number

  // fees
  feesUSD: number
  feeChange: number

  // transactions
  txCount: number
  txCountChange: number
}

export interface ProtocolState {
  [networkId: string]: {
    // timestamp for last updated fetch
    readonly lastUpdated: number | undefined
    // overview data
    readonly data: ProtocolData | undefined
    readonly chartData: ChartDayData[] | undefined
    readonly transactions: Transaction[] | undefined
  }
}

export const initialState: ProtocolState = {}

const networks = [
  ChainId.ETHEREUM,
  ChainId.BSCMAINNET,
  ChainId.ROPSTEN,
  ChainId.RINKEBY,
  ChainId.ARBITRUM,
  ChainId.POLYGON,
  ChainId.AVAXMAINNET,
  ChainId.FANTOM,
  ChainId.CRONOS,
  ChainId.BTTC,
  ChainId.VELAS,
  ChainId.AURORA,
  ChainId.OASIS,
  ChainId.OPTIMISM,
]
networks.forEach((net) => {
  initialState[net] = { data: undefined, chartData: undefined, transactions: undefined, lastUpdated: undefined }
})

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateProtocolData, (state, { payload: { protocolData, networkId } }) => {
      state[networkId].data = protocolData
      // mark when last updated
      state[networkId].lastUpdated = currentTimestamp()
    })
    .addCase(updateChartData, (state, { payload: { chartData, networkId } }) => {
      state[networkId].chartData = chartData
    })
    .addCase(updateTransactions, (state, { payload: { transactions, networkId } }) => {
      // TODO viet-nv
      state[networkId].transactions = transactions || {}
    })
)
