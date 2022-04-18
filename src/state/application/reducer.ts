import { createReducer, nanoid } from '@reduxjs/toolkit'
import { ChainId } from 'constants/networks'
import { PopupContent, updateBlockNumber, updateSubgraphStatus, ApplicationModal, setOpenModal } from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId in ChainId]?: number }
  readonly openModal: ApplicationModal | null
  readonly subgraphStatus: {
    available: boolean | null
    syncedBlock: number | undefined
    headBlock: number | undefined
  }
  // readonly activeNetworkVersion: NetworkInfo
}

const initialState: ApplicationState = {
  blockNumber: {},
  openModal: null,
  subgraphStatus: {
    available: null,
    syncedBlock: undefined,
    headBlock: undefined,
  },
  // activeNetworkVersion: EthereumNetworkInfo,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId] || 0)
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(updateSubgraphStatus, (state, { payload: { available, syncedBlock, headBlock } }) => {
      state.subgraphStatus = {
        available,
        syncedBlock,
        headBlock,
      }
    })
)
