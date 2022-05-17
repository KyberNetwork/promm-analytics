/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from 'constants/networks'
import { PoolData } from 'state/pools/reducer'
import { TokenData } from 'state/tokens/reducer'
import { updateVersion } from '../global/actions'
import {
  updateMatchesDarkMode,
  updateUserDarkMode,
  addSavedToken,
  addSavedPool,
  toggleIsFirstTimeVisit,
} from './actions'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches

  savedTokens: {
    [chainId in ChainId]?: {
      [tokenAddress: string]: TokenData
    }
  }
  savedPools: {
    [chainId in ChainId]?: {
      [poolAddress: string]: PoolData
    }
  }

  timestamp: number

  isFirstTimeVisit: boolean
}

export const initialState: UserState = {
  userDarkMode: true,
  matchesDarkMode: false,
  savedTokens: {},
  savedPools: {},
  timestamp: currentTimestamp(),
  isFirstTimeVisit: true,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(addSavedToken, (state, { payload: { networkId, token } }) => {
      if (Array.isArray(state.savedTokens)) {
        state.savedTokens = {}
      }
      if (!state.savedTokens?.[networkId]?.[token.address]) {
        const tokenByChain = state.savedTokens?.[networkId] || {}
        tokenByChain[token.address] = token
        const newTokens = {
          ...(state.savedTokens || {}),
          [networkId]: tokenByChain,
        }
        state.savedTokens = newTokens
      }
      // toggle for delete
      else {
        delete state.savedTokens[networkId]![token.address]
      }
    })
    .addCase(addSavedPool, (state, { payload: { networkId, pool } }) => {
      if (Array.isArray(state.savedPools)) {
        state.savedPools = {}
      }
      if (!state.savedPools?.[networkId]?.[pool.address]) {
        const poolByChain = state.savedPools?.[networkId] || {}
        poolByChain[pool.address] = pool
        const newPools = {
          ...(state.savedPools || {}),
          [networkId]: poolByChain,
        }
        state.savedPools = newPools
      }
      // toggle for delete
      else {
        delete state.savedPools[networkId]![pool.address]
      }
    })
    .addCase(toggleIsFirstTimeVisit, (state) => {
      state.isFirstTimeVisit = false
    })
)
