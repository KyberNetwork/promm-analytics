import { createReducer } from '@reduxjs/toolkit'
import { ChainId, ALL_SUPPORT_NETWORKS_ID } from 'constants/networks'
import { updateBlockNumber, updateSubgraphStatus, ApplicationModal, setOpenModal, updateActiveNetwork } from './actions'

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId in ChainId]?: number }
  readonly openModal: ApplicationModal | null
  readonly subgraphStatus: {
    available: boolean | null
    syncedBlock: number | undefined
    headBlock: number | undefined
  }
  activeNetworksId: ChainId[]
}

const initialState: ApplicationState = {
  blockNumber: {},
  openModal: null,
  subgraphStatus: {
    available: null,
    syncedBlock: undefined,
    headBlock: undefined,
  },
  activeNetworksId: [ChainId.ETHEREUM],
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
    .addCase(updateActiveNetwork, (state, action) => {
      const { chainId } = action.payload
      if (chainId === 'allchain') {
        return {
          ...state,
          activeNetworksId: ALL_SUPPORT_NETWORKS_ID,
        }
      }
      return {
        ...state,
        activeNetworksId: [chainId as ChainId],
      }
    })
    .addCase(updateSubgraphStatus, (state, { payload: { available, syncedBlock, headBlock } }) => {
      state.subgraphStatus = {
        available,
        syncedBlock,
        headBlock,
      }
    })
)
