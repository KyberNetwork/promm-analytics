import 'inter-ui'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './i18n'
import App from './pages/App'
import store from './state'
import UserUpdater from './state/user/updater'
import ProtocolUpdater from './state/protocol/updater'
import TokenUpdater from './state/tokens/updater'
import PoolUpdater from './state/pools/updater'
import ApplicationUpdater from './state/application/updater'
import ListUpdater from './state/lists/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import { ApolloProvider } from '@apollo/client/react'
import { client } from 'apollo/client'

function Updaters() {
  return (
    <>
      <ListUpdater />
      <UserUpdater />
      <ProtocolUpdater />
      <TokenUpdater />
      <PoolUpdater />
      <ApplicationUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <ApolloProvider client={client}>
      <Provider store={store}>
        <BrowserRouter>
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
