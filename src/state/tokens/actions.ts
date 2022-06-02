import { createAction } from '@reduxjs/toolkit'
import { TokenData, TokenChartEntry } from './reducer'
import { PriceChartEntry, Transaction } from 'types'
import { ChainId } from 'constants/networks'

// protocol wide info
export const updateTokenData = createAction<{ tokens: TokenData[]; networkId: ChainId }>('tokens/updateTokenData')

// add token address to byAddress
export const addTokenKeys = createAction<{ tokenAddresses: string[]; networkId: ChainId }>('tokens/addTokenKeys')

// add list of pools token is in
export const addPoolAddresses = createAction<{
  tokenAddress: string
  poolAddresses: string[]
  networkId: ChainId
}>('tokens/addPoolAddresses')

// tvl and volume data over time
export const updateChartData = createAction<{
  tokenAddress: string
  chartData: TokenChartEntry[]
  networkId: ChainId
}>('tokens/updateChartData')

// transactions
export const updateTransactions = createAction<{
  tokenAddress: string
  transactions: Transaction[]
  networkId: ChainId
}>('tokens/updateTransactions')

// price data at arbitrary intervals
export const updatePriceData = createAction<{
  tokenAddress: string
  secondsInterval: number
  priceData: PriceChartEntry[] | undefined
  oldestFetchedTimestamp: number
  networkId: ChainId
}>('tokens/updatePriceData')
