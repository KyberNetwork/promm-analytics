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
import { ChainId } from 'constants/networks'
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
    readonly [networkId: string]: {
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

// wip
// const getAutoLowercaseObj = () =>
//   new Proxy({} as { [key: string]: unknown }, {
//     get(target, p, ...args) {
//       if (typeof p === 'string') return target[p.toLowerCase()]
//       return Reflect.get(target, p, ...args)
//     },
//     set(target, p, value, ...args) {
//       if (typeof p === 'string') target[p.toLowerCase()] = value
//       return Reflect.set(target, p, ...args)
//     },
//   })

export const initialState: PoolsState = {
  byAddress: {
    [ChainId.ETHEREUM]: {},
    [ChainId.BSCMAINNET]: {},
    [ChainId.ROPSTEN]: {},
    [ChainId.RINKEBY]: {},
    [ChainId.ARBITRUM]: {},
    [ChainId.POLYGON]: {},
    [ChainId.AVAXMAINNET]: {},
    [ChainId.FANTOM]: {},
    [ChainId.CRONOS]: {},
    [ChainId.BTTC]: {},
    [ChainId.VELAS]: {},
    [ChainId.AURORA]: {},
    [ChainId.OASIS]: {},
    [ChainId.OPTIMISM]: {},
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updatePoolData, (state, { payload: { pools, networkId } }) => {
      pools.map(
        (poolData) =>
          (state.byAddress[networkId][poolData.address.toLowerCase()] = {
            ...state.byAddress[networkId][poolData.address.toLowerCase()],
            data: poolData,
            lastUpdated: currentTimestamp(),
          })
      )
    })
    // add address to byAddress keys if not included yet
    .addCase(addPoolKeys, (state, { payload: { poolAddresses, networkId } }) => {
      poolAddresses.map((address) => {
        if (!state.byAddress[networkId][address.toLowerCase()]) {
          state.byAddress[networkId][address.toLowerCase()] = {
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
      state.byAddress[networkId][poolAddress.toLowerCase()] = {
        ...state.byAddress[networkId][poolAddress.toLowerCase()],
        chartData,
      }
    })
    .addCase(updatePoolRatesData, (state, { payload: { poolAddress, ratesData, timeWindow, networkId } }) => {
      state.byAddress[networkId][poolAddress.toLowerCase()] = {
        ...state.byAddress[networkId][poolAddress.toLowerCase()],
        ratesData: {
          ...state.byAddress[networkId][poolAddress.toLowerCase()].ratesData,
          [timeWindow]: ratesData,
        },
      }
    })
    .addCase(updatePoolTransactions, (state, { payload: { poolAddress, transactions, networkId } }) => {
      state.byAddress[networkId][poolAddress.toLowerCase()] = {
        ...state.byAddress[networkId][poolAddress.toLowerCase()],
        transactions,
      }
    })
    .addCase(updateTickData, (state, { payload: { poolAddress, tickData, networkId } }) => {
      state.byAddress[networkId][poolAddress.toLowerCase()] = {
        ...state.byAddress[networkId][poolAddress.toLowerCase()],
        tickData,
      }
    })
)
