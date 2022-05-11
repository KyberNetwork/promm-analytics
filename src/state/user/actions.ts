import { createAction } from '@reduxjs/toolkit'
import { ChainId } from 'constants/networks'
import { PoolData } from 'state/pools/reducer'
import { TokenData } from 'state/tokens/reducer'

export interface SerializedToken {
  chainId: ChainId
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
export const removeSerializedToken = createAction<{ chainId: ChainId; address: string }>('user/removeSerializedToken')
export const addSavedToken = createAction<{ networkId: ChainId; token: TokenData }>('user/addSavedToken')
export const addSavedPool = createAction<{ networkId: ChainId; pool: PoolData }>('user/addSavedPool')
export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('user/addSerializedPair')
export const removeSerializedPair = createAction<{ chainId: ChainId; tokenAAddress: string; tokenBAddress: string }>(
  'user/removeSerializedPair'
)
export const toggleURLWarning = createAction<void>('app/toggleURLWarning')
export const toggleIsFirstTimeVisit = createAction<void>('user/toggleIsFirstTimeVisit')
