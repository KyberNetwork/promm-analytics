import { Token } from '@uniswap/sdk-core'
import { useCallback, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import {
  addSerializedToken,
  removeSerializedToken,
  SerializedToken,
  updateUserDarkMode,
  toggleURLWarning,
  addSavedToken,
  addSavedPool,
} from './actions'
import { useAppSelector } from 'hooks/useAppDispatch'
import { PoolData } from 'state/pools/reducer'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { TokenData } from 'state/tokens/reducer'
import { ChainId } from 'constants/networks'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useSavedTokens(): [
  {
    [chainId in ChainId]?: {
      [tokenAddress: string]: TokenData
    }
  },
  (id: ChainId, token: TokenData) => void
] {
  const dispatch = useDispatch<AppDispatch>()
  const savedTokens = useSelector((state: AppState) => state.user.savedTokens) || {}

  const updatedSavedTokens = useCallback(
    (id: ChainId, token: TokenData) => {
      dispatch(addSavedToken({ networkId: id, token }))
    },
    [dispatch]
  )
  return [savedTokens, updatedSavedTokens]
}

export function useSavedPools(): [
  {
    [chainId in ChainId]: {
      [address: string]: PoolData
    }
  },
  (id: ChainId, pool: PoolData) => void
] {
  const dispatch = useDispatch<AppDispatch>()

  const savedPools = useSelector((state: AppState) => state.user.savedPools)
  const updateSavedPools = useCallback(
    (id: ChainId, pool: PoolData) => {
      dispatch(addSavedPool({ networkId: id, pool }))
    },
    [dispatch]
  )
  return [savedPools ?? {}, updateSavedPools]
}

export function useRemoveUserAddedToken(): (chainId: ChainId, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: ChainId, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}
