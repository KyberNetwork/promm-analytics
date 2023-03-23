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
import { EthereumNetworkInfo } from 'constants/networks'
import { useGlobalData } from 'data'
import { createClient } from 'apollo/client'

function Updaters() {
  useGlobalData()
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
    </>
  )
}
const defaultClient = createClient(EthereumNetworkInfo.defaultSubgraph)

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <ApolloProvider client={defaultClient}>
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
