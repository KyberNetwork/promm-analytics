import { ChainId } from 'constants/networks'

export interface Block {
  number: number
  timestamp: string
}

export enum VolumeWindow {
  daily,
  weekly,
  monthly,
}

export interface ChartDayData {
  date: number
  volumeUSD: number
  tvlUSD: number
}

export interface GenericChartEntry {
  time: string
  value: number
}

export enum TransactionType {
  SWAP,
  MINT,
  BURN,
  ALL,
}

export type Transaction = {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  amountUSD: number
  amountToken0: number
  amountToken1: number
  chainId: ChainId
}

/**
 * Formatted type for Candlestick charts
 */
export type PriceChartEntry = {
  time: number // unix timestamp
  open: number
  close: number
  // high: number
  // low: number
}
