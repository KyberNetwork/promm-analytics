import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import protocol from './protocol/reducer'
import tokens from './tokens/reducer'
import pools from './pools/reducer'
import ksSettingApi from 'services/ksSetting'

const PERSISTED_KEYS: string[] = ['user']

const store = configureStore({
  reducer: {
    application,
    user,
    protocol,
    tokens,
    pools,
    [ksSettingApi.reducerPath]: ksSettingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, immutableCheck: false, serializableCheck: false })
      .concat(save({ states: PERSISTED_KEYS }))
      .concat(ksSettingApi.middleware),
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())
// setupListeners(store.dispatch)

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
