import { TickProcessed } from './../../data/pools/tickData'
import { createAction } from '@reduxjs/toolkit'
import { PoolData, PoolChartEntry, PoolRatesEntry } from './reducer'
import { Transaction } from 'types'
import { ChainId, ChainIdType } from 'constants/networks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'

// protocol wide info
export const updatePoolData = createAction<{ pools: PoolData[]; networkId: ChainIdType }>('pools/updatePoolData')

// add pool address to byAddress
export const addPoolKeys = createAction<{ poolAddresses: string[]; networkId: ChainId }>('pool/addPoolKeys')

export const updatePoolChartData = createAction<{
  poolAddress: string
  chartData: PoolChartEntry[]
  networkId: ChainId
}>('pool/updatePoolChartData')

export const updatePoolRatesData = createAction<{
  poolAddress: string
  ratesData: [PoolRatesEntry[], PoolRatesEntry[]]
  timeWindow: TimeframeOptions
  networkId: ChainId
}>('pool/updatePoolRatesData')

export const updatePoolTransactions = createAction<{
  poolAddress: string
  transactions: Transaction[]
  networkId: ChainId
}>('pool/updatePoolTransactions')

export const updateTickData = createAction<{
  poolAddress: string
  tickData:
    | {
        ticksProcessed: TickProcessed[]
        feeTier: string
        tickSpacing: number
        activeTickIdx: number
      }
    | undefined
  networkId: ChainId
}>('pool/updateTickData')
