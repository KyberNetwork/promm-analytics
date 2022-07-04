import { DEFAULT_ACTIVE_LIST_URLS, UNSUPPORTED_LIST_URLS } from './../../constants/lists'
import { createReducer } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { DEFAULT_LIST_OF_LISTS } from '../../constants/lists'
import { fetchTokenList } from './actions'
import { pushUnique } from 'utils'

export interface ListsState {
  readonly byUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }

  // currently active lists
  readonly activeListUrls: string[] | undefined
}

type ListState = ListsState['byUrl'][string]

const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] }

const initialState: ListsState = {
  byUrl: {
    ...DEFAULT_LIST_OF_LISTS.concat(UNSUPPORTED_LIST_URLS).reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
      memo[listUrl] = NEW_LIST_STATE
      return memo
    }, {}),
  },
  activeListUrls: DEFAULT_ACTIVE_LIST_URLS,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: requestId,
        error: null,
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { tokenList, url } }) => {
      // activate if on default active
      if (DEFAULT_ACTIVE_LIST_URLS.includes(url)) {
        state.activeListUrls = pushUnique(state.activeListUrls, url)
      }

      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: null,
        current: tokenList,
      }
    })
    .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage } }) => {
      if (state.byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: errorMessage,
        current: null,
      }
    })
)
