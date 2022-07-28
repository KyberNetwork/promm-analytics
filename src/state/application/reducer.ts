import { createReducer } from '@reduxjs/toolkit'
import { ALL_CHAIN_ID } from 'constants/index'
import { ChainId, NETWORKS_INFO_MAP } from 'constants/networks'
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
  isAppInit: boolean
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
  isAppInit: false,
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
          activeNetworksId: Object.keys(NETWORKS_INFO_MAP).map(Number),
          isAppInit: true,
        }
      }
      return {
        ...state,
        activeNetworksId: [chainId as ChainId],
        isAppInit: true,
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
