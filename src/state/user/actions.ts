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
export const addSavedToken = createAction<{ networkId: ChainId; token: TokenData }>('user/addSavedToken')
export const addSavedPool = createAction<{ networkId: ChainId; pool: PoolData }>('user/addSavedPool')
export const addSavedAccount = createAction<{ networkId: ChainId; accountAddress: string }>('user/addSavedAccount')
export const toggleIsFirstTimeVisit = createAction<void>('user/toggleIsFirstTimeVisit')
