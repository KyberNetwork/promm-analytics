import { createReducer } from '@reduxjs/toolkit'
import { ALL_CHAIN_ID } from 'constants/index'
import { ChainId, ALL_SUPPORT_NETWORKS_ID, SHOW_NETWORKS } from 'constants/networks'
import {
  updateBlockNumber,
  updateSubgraphStatus,
  ApplicationModal,
  setOpenModal,
  updateActiveNetwork,
  setLoading,
} from './actions'

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId in ChainId]?: number }
  readonly openModal: ApplicationModal | null
  readonly subgraphStatus: {
    available: boolean | null
    syncedBlock: number | undefined
    headBlock: number | undefined
  }
  activeNetworksId: ChainId[]
  loading: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  openModal: null,
  subgraphStatus: {
    available: null,
    syncedBlock: undefined,
    headBlock: undefined,
  },
  activeNetworksId: [SHOW_NETWORKS[0]],
  loading: true,
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
      if (chainId === ALL_CHAIN_ID) {
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
    .addCase(setLoading, (state, { payload: { loading } }) => {
      state.loading = loading
    })
)
