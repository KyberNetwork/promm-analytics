import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from 'constants/networks'
import { PoolData } from 'state/pools/reducer'
import { TokenData } from 'state/tokens/reducer'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateMatchesDarkMode,
  updateUserDarkMode,
  toggleURLWarning,
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

  tokens: {
    [chainId in ChainId]?: {
      [address: string]: SerializedToken
    }
  }

  pairs: {
    [chainId in ChainId]?: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

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
  URLWarningVisible: boolean

  isFirstTimeVisit: boolean
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  userDarkMode: true,
  matchesDarkMode: false,
  tokens: {},
  pairs: {},
  savedTokens: {},
  savedPools: {},
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
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
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId]![serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId]![address]
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
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId]![pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId]) {
        // just delete both keys if either exists
        delete state.pairs[chainId]![pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId]![pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(toggleURLWarning, (state) => {
      state.URLWarningVisible = !state.URLWarningVisible
    })
    .addCase(toggleIsFirstTimeVisit, (state) => {
      state.isFirstTimeVisit = false
    })
)
