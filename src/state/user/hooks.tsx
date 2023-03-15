import { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { updateUserDarkMode, addSavedToken, addSavedPool, toggleIsFirstTimeVisit, addSavedAccount } from './actions'
import { PoolData } from 'state/pools/reducer'
import { TokenData } from 'state/tokens/reducer'
import { ChainId } from 'constants/networks'

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

export function useIsFirstTimeVisit(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const isFirstTimeVisit = useSelector((state: AppState) => state.user.isFirstTimeVisit)

  const toggle = useCallback(() => {
    dispatch(toggleIsFirstTimeVisit())
  }, [dispatch])

  return [isFirstTimeVisit, toggle]
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
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

  const updateSavedTokens = useCallback(
    (id: ChainId, token: TokenData) => {
      dispatch(addSavedToken({ networkId: id, token }))
    },
    [dispatch]
  )
  return [savedTokens, updateSavedTokens]
}

export function useSavedPools(): [
  {
    [chainId in ChainId]?: {
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

export function useSavedAccounts(): [
  {
    [chainId in ChainId]?: {
      [address: string]: boolean
    }
  },
  (id: ChainId, accountAddress: string) => void
] {
  const dispatch = useDispatch<AppDispatch>()

  const savedAccounts = useSelector((state: AppState) => state.user.savedAccounts)
  const updateSavedAccounts = useCallback(
    (id: ChainId, accountAddress: string) => {
      dispatch(addSavedAccount({ networkId: id, accountAddress }))
    },
    [dispatch]
  )
  return [savedAccounts ?? {}, updateSavedAccounts]
}
