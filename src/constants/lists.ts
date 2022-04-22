// used to mark unsupported tokens, these are hosted lists of unsupported tokens

import { NETWORKS_INFO_LIST } from './networks'

export const UNSUPPORTED_LIST_URLS: string[] = []
export const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json'
export const ARBITRUM_LIST = 'https://bridge.arbitrum.io/token-list-42161.json'
export const POLYGON_LIST =
  'https://unpkg.com/quickswap-default-token-list@1.2.2/build/quickswap-default.tokenlist.json'

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...NETWORKS_INFO_LIST.map((networkInfo) => networkInfo.tokenListUrl),
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [OPTIMISM_LIST, ARBITRUM_LIST, POLYGON_LIST]
