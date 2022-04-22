import { createAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { ChainId } from 'constants/networks'

export type PopupContent = {
  listUpdate: {
    listUrl: string
    oldList: TokenList
    newList: TokenList
    auto: boolean
  }
  txn?: { hash: string; success: boolean; summary: string }
}

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  MENU,
}

export const updateBlockNumber = createAction<{ chainId: ChainId; blockNumber: number }>(
  'application/updateBlockNumber'
)
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const updateSubgraphStatus = createAction<{
  available: boolean | null
  syncedBlock: number | undefined
  headBlock: number | undefined
}>('application/updateSubgraphStatus')
export const updateActiveNetwork = createAction<{ chainId: ChainId | 'allchain' }>('application/updateActiveNetwork')
