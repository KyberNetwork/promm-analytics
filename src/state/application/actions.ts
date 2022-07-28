import { createAction } from '@reduxjs/toolkit'
import { ChainId, ChainIdType } from 'constants/networks'

export enum ApplicationModal {
  WALLET = 'WALLET',
  SETTINGS = 'SETTINGS',
  MENU = 'MENU',
  DROPDOWN = 'DROPDOWN',
  CHART_VIEW_DROPDOWN = 'CHART_VIEW_DROPDOWN',
  TIME_DROPDOWN = 'TIME_DROPDOWN',
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
export const updateActiveNetwork = createAction<{ chainId: ChainIdType }>('application/updateActiveNetwork')
