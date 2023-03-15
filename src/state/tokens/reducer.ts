import { currentTimestamp } from './../../utils/index'
import {
  updateTokenData,
  addTokenKeys,
  addPoolAddresses,
  updateChartData,
  updatePriceData,
  updateTransactions,
  setWhitelistToken,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { PriceChartEntry, Transaction } from 'types'
import { ALL_SUPPORTED_NETWORKS, ChainId } from 'constants/networks'
import { Token } from '@kyberswap/ks-sdk-core'

export type TokenData = {
  // token is in some pool on uniswap
  exists: boolean

  // basic token info
  name: string
  symbol: string
  address: string

  // volume
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  txCount: number

  //fees
  feesUSD: number
  feesUSDChange: number

  // tvl
  tvlToken: number
  tvlUSD: number
  tvlUSDChange: number

  priceUSD: number
  priceUSDChange: number
  priceUSDChangeWeek: number

  chainId: ChainId
}

export interface TokenChartEntry {
  date: number
  volumeUSD: number
  totalValueLockedUSD: number
}

export interface WrappedToken extends Token {
  logoURI: string
}
export type WhiteListTokenMap = {
  [address: string]: WrappedToken
}
export type WhiteListTokenMapByChain = {
  [chainId: string]: WhiteListTokenMap
}

export interface TokensState {
  // analytics data from
  byAddress: {
    [networkId: string]: {
      [address: string]: {
        data: TokenData | undefined
        poolAddresses: string[] | undefined
        chartData: TokenChartEntry[] | undefined
        priceData: {
          oldestFetchedTimestamp?: number | undefined
          [secondsInterval: number]: PriceChartEntry[] | undefined
        }
        transactions: Transaction[] | undefined
        lastUpdated: number | undefined
      }
    }
  }
  mapWhitelistToken: WhiteListTokenMapByChain
}

export const initialState: TokensState = {
  byAddress: {},
  mapWhitelistToken: {},
}
ALL_SUPPORTED_NETWORKS.forEach((chainId) => {
  initialState.byAddress[chainId] = {}
})

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateTokenData, (state, { payload: { tokens, networkId } }) => {
      tokens.map(
        (tokenData) =>
          (state.byAddress[networkId][tokenData.address] = {
            ...state.byAddress[networkId][tokenData.address],
            data: tokenData,
            lastUpdated: currentTimestamp(),
          })
      )
    }) // add address to byAddress keys if not included yet
    .addCase(addTokenKeys, (state, { payload: { tokenAddresses, networkId } }) => {
      tokenAddresses.map((address) => {
        if (!state.byAddress[networkId][address]) {
          state.byAddress[networkId][address] = {
            poolAddresses: undefined,
            data: undefined,
            chartData: undefined,
            priceData: {},
            transactions: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })
    // add list of pools the token is included in
    .addCase(addPoolAddresses, (state, { payload: { tokenAddress, poolAddresses, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], poolAddresses }
    })
    // add list of pools the token is included in
    .addCase(updateChartData, (state, { payload: { tokenAddress, chartData, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], chartData }
    })
    // add list of pools the token is included in
    .addCase(updateTransactions, (state, { payload: { tokenAddress, transactions, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], transactions }
    })
    // update historical price volume based on interval size
    .addCase(
      updatePriceData,
      (state, { payload: { tokenAddress, secondsInterval, priceData, oldestFetchedTimestamp, networkId } }) => {
        state.byAddress[networkId][tokenAddress] = {
          ...state.byAddress[networkId][tokenAddress],
          priceData: {
            ...state.byAddress[networkId][tokenAddress].priceData,
            [secondsInterval]: priceData,
            oldestFetchedTimestamp,
          },
        }
      }
    )
    .addCase(setWhitelistToken, (state, { payload }) => {
      state.mapWhitelistToken = payload
    })
)
