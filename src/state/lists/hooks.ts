import { UNSUPPORTED_LIST_URLS } from './../../constants/lists'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { Tags, TokenList } from '@uniswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../index'
import sortByListPriority from 'utils/listSort'
import { WrappedTokenInfo } from './wrappedTokenInfo'
import { ChainId } from 'constants/networks'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

export type TokenAddressMap = Readonly<
  {
    [chainId in ChainId]?: Readonly<{
      [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList }
    }>
  }
>

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  const map = list.tokens.reduce<Mutable<TokenAddressMap>>((tokenMap, tokenInfo) => {
    const token = new WrappedTokenInfo(tokenInfo, list)
    if (tokenMap[token.chainId]?.[token.address] !== undefined) {
      console.error(`Duplicate token! ${token.address}`)
      return tokenMap
    }
    if (!tokenMap[token.chainId]) tokenMap[token.chainId] = {}
    tokenMap[token.chainId]![token.address] = {
      token,
      list,
    }
    return tokenMap
  }, {}) as TokenAddressMap
  listCache?.set(list, map)
  return map
}

const TRANSFORMED_DEFAULT_TOKEN_LIST = listToTokenMap(DEFAULT_TOKEN_LIST)

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  return useSelector<AppState, AppState['lists']['byUrl']>((state) => state.lists.byUrl)
}

/**
 * Combine the tokens in map2 with the tokens on map1, where tokens on map1 take precedence
 * @param map1 the base token map
 * @param map2 the map of additioanl tokens to add to the base map
 */
function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  const chainIds: ChainId[] = Object.keys(
    Object.keys(map1)
      .concat(Object.keys(map2))
      .reduce<{ [chainId: string]: true }>((acc, value) => {
        acc[value] = true
        return acc
      }, {})
  ).map((id) => parseInt(id))

  return chainIds.reduce<Mutable<TokenAddressMap>>((memo, chainId) => {
    memo[chainId] = {
      ...map2[chainId],
      // map1 takes precedence
      ...map1[chainId],
    }
    return memo
  }, {}) as TokenAddressMap
}

// merge tokens contained within lists from urls
function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists()
  return useMemo(() => {
    if (!urls) return {}
    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            return combineMaps(allTokens, listToTokenMap(current))
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, {})
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>((state) => state.lists.activeListUrls)?.filter(
    (url) => !UNSUPPORTED_LIST_URLS.includes(url)
  )
}

// export function useInactiveListUrls(): string[] {
//   const lists = useAllLists()
//   const allActiveListUrls = useActiveListUrls()
//   return Object.keys(lists).filter((url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url))
// }

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  return combineMaps(activeTokens, TRANSFORMED_DEFAULT_TOKEN_LIST)
}

// all tokens from inactive lists
// export function useCombinedInactiveList(): TokenAddressMap {
//   const allInactiveListUrls: string[] = useInactiveListUrls()
//   return useCombinedTokenMapFromUrls(allInactiveListUrls)
// }

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}
