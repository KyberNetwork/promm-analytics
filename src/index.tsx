import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './pages/App'
import store from './state'
import UserUpdater from './state/user/updater'
import ApplicationUpdater from './state/application/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import { ApolloProvider } from '@apollo/client/react'
import { ChainId, NETWORKS_INFO_MAP } from 'constants/networks'
import { useGlobalData } from 'data'

function Updaters() {
  useGlobalData()
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <ApolloProvider client={NETWORKS_INFO_MAP[ChainId.ETHEREUM].client}>
      <Provider store={store}>
        <BrowserRouter basename="/elastic">
          <Updaters />
          <ThemeProvider>
            <ThemedGlobalStyle />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById('root')
)
