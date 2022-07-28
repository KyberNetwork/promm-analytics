import { currentTimestamp } from './../../utils/index'
import {
  updatePoolData,
  addPoolKeys,
  updatePoolChartData,
  updatePoolTransactions,
  updateTickData,
  updatePoolRatesData,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { SerializedToken } from 'state/user/actions'
import { Transaction } from 'types'
import { PoolTickData } from 'data/pools/tickData'
import { ALL_SUPPORTED_NETWORKS, ChainId } from 'constants/networks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'

export interface Pool {
  address: string
  token0: SerializedToken
  token1: SerializedToken
}

export interface PoolData {
  // basic token info
  address: string
  feeTier: number
  fee: number

  token0: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  token1: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  // for tick math
  liquidity: number
  reinvestL: number
  sqrtPrice: number
  tick: number

  // volume
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number

  // liquidity
  tvlUSD: number
  tvlUSDChange: number

  // prices
  token0Price: number
  token1Price: number

  // token amounts
  tvlToken0: number
  tvlToken1: number
  apr: number

  chainId: ChainId
}

export type PoolChartEntry = {
  date: number
  volumeUSD: number
  totalValueLockedUSD: number
  feesUSD: number
}

export type PoolRatesEntry = {
  time: number
  open: number
  close: number
}

export interface PoolsState {
  // analytics data from
  byAddress: {
    [networkId: string]: {
      [address: string]: {
        data: PoolData | undefined
        chartData: PoolChartEntry[] | undefined
        ratesData:
          | {
              [timeWindow in TimeframeOptions]?: [PoolRatesEntry[], PoolRatesEntry[]] | undefined
            }
          | undefined
        transactions: Transaction[] | undefined
        lastUpdated: number | undefined
        tickData: PoolTickData | undefined
      }
    }
  }
}

export const initialState: PoolsState = {
  byAddress: {},
}

ALL_SUPPORTED_NETWORKS.forEach((chainId) => {
  initialState.byAddress[chainId] = {}
})

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools, networkId } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[networkId][poolData.address] = {
            ...state.byAddress[networkId][poolData.address],
            data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses, networkId } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[networkId][address]) {
          state.byAddress[networkId][address] = {
            data: undefined,
            chartData: undefined,
            ratesData: undefined,
            transactions: undefined,
            lastUpdated: undefined,
            tickData: undefined,
          }
        }
      })
    })
    .addCase(updatePoolChartData, (state, { payload: { poolAddress, chartData, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], chartData: chartData }
    })
    .addCase(updatePoolRatesData, (state, { payload: { poolAddress, ratesData, timeWindow, networkId } }) => {
      state.byAddress[networkId][poolAddress] = {
        ...state.byAddress[networkId][poolAddress],
        ratesData: {
          ...state.byAddress[networkId][poolAddress].ratesData,
          [timeWindow]: ratesData,
        },
      }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], transactions }
    })
    .addCase(updateTickData, (state, { payload: { poolAddress, tickData, networkId } }) => {
      state.byAddress[networkId][poolAddress] = { ...state.byAddress[networkId][poolAddress], tickData }
    })
)
