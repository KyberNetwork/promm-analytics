import React, { Suspense, useState, useEffect } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'
import styled from 'styled-components'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Home from './Home'
import PoolsOverview from './Pool/PoolsOverview'
import TokensOverview from './Token/TokensOverview'
import { RedirectInvalidToken } from './Token/redirects'
import PoolPage from './Pool/PoolPage'
import { ExternalLink, TYPE } from 'theme'
import { useActiveNetworks, useSubgraphStatus } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import SideNav from 'components/Layout/SideNav'
import KyberLoading from 'components/Loader/KyberLoading'
import { Flex } from 'rebass'
import PinnedData from 'components/PinnedData'
import AccountsOverview from './Accounts/AccountsOverview'
import AccountPage from './Accounts/AccountPage'
import { NETWORKS_INFO_LIST, NETWORKS_INFO_MAP, SHOW_NETWORKS } from 'constants/networks'
import { updateActiveNetwork } from 'state/application/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'

const ContentWrapper = styled.div<{ open: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '220px 1fr 200px' : '220px 1fr 64px')};

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    grid-template-columns: 220px 1fr;
  `}

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  `}
  background-color: ${({ theme }) => theme.buttonBlack};
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 36px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  > * {
    max-width: 1440px;
  }

  @media (max-width: 1080px) {
    padding-top: 36px;
    margin-top: 0;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const Hide1080 = styled.div`
  @media (max-width: 1080px) {
    display: none;
  }
`

const WarningWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const WarningBanner = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  padding: 1rem;
  color: white;
  font-size: 14px;
  width: 100%;
  text-align: center;
  font-weight: 500;
`

const BLOCK_DIFFERENCE_THRESHOLD = 30

const NetworkReader: React.FunctionComponent<React.PropsWithChildren<any>> = ({ children }) => {
  const { networkID: currentNetworkURL } = useParams<{ networkID: string }>()

  const networkInfoFromURL = NETWORKS_INFO_LIST.find((networkInfo) => networkInfo.route === currentNetworkURL)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!currentNetworkURL) {
      dispatch(updateActiveNetwork({ chainId: 'allchain' }))
    } else if (networkInfoFromURL) {
      dispatch(updateActiveNetwork({ chainId: networkInfoFromURL.chainId || 'allchain' }))
    }
  }, [currentNetworkURL, networkInfoFromURL, dispatch])
  if (currentNetworkURL && !networkInfoFromURL) return <Redirect to="/home" />

  return children
}

export default function App(): JSX.Element {
  const [savedOpen, setSavedOpen] = useState(false)
  // pretend load buffer
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 1300)
  }, [])

  const activeNetwork = useActiveNetworks()
  // subgraph health
  const [subgraphStatus] = useSubgraphStatus()

  const showNotSyncedWarning =
    subgraphStatus.headBlock && subgraphStatus.syncedBlock
      ? subgraphStatus.headBlock - subgraphStatus.syncedBlock > BLOCK_DIFFERENCE_THRESHOLD
      : false

  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      {loading ? (
        <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center">
          <KyberLoading />
        </Flex>
      ) : (
        <>
          {/* <HeaderWrapper> */}
          {/*   {showNotSyncedWarning && ( */}
          {/*     <WarningWrapper> */}
          {/*       <WarningBanner> */}
          {/*         {`Warning: */}
          {/*         Data has only synced to Optimism block ${subgraphStatus.syncedBlock} (out of ${subgraphStatus.headBlock}). Please check back soon.`} */}
          {/*       </WarningBanner> */}
          {/*     </WarningWrapper> */}
          {/*   )} */}
          {/*   <Hide1080> */}
          {/*     <TopBar /> */}
          {/*   </Hide1080> */}
          {/*   <Header /> */}
          {/* </HeaderWrapper> */}
          {subgraphStatus.available === false ? (
            <BodyWrapper>
              <DarkGreyCard style={{ maxWidth: '340px' }}>
                <TYPE.label>
                  The Graph hosted network which provides data for this site is temporarily experiencing issues. Check
                  current status{' '}
                  <ExternalLink href="https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3">
                    here.
                  </ExternalLink>
                </TYPE.label>
              </DarkGreyCard>
            </BodyWrapper>
          ) : (
            <ContentWrapper open={savedOpen}>
              <SideNav />
              <BodyWrapper>
                <Switch>
                  <Route
                    exact
                    strict
                    path="/:networkID?/pools"
                    render={() => (
                      <NetworkReader>
                        <PoolsOverview />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    strict
                    path="/:networkID?/pool/:address"
                    render={() => (
                      <NetworkReader>
                        <PoolPage />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    strict
                    path="/:networkID?/tokens"
                    render={() => (
                      <NetworkReader>
                        <TokensOverview />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    strict
                    path="/:networkID?/token/:address"
                    render={() => (
                      <NetworkReader>
                        <RedirectInvalidToken />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    strict
                    path="/:networkID?/accounts"
                    render={() => (
                      <NetworkReader>
                        <AccountsOverview />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    strict
                    path="/:networkID?/account/:address"
                    render={() => (
                      <NetworkReader>
                        <AccountPage />
                      </NetworkReader>
                    )}
                  />
                  <Route
                    exact
                    path="/:networkID?/home"
                    render={() => (
                      <NetworkReader>
                        <Home />
                      </NetworkReader>
                    )}
                  />
                  <Redirect to={`/${NETWORKS_INFO_MAP[SHOW_NETWORKS[0]].route}/home`} />
                </Switch>
                <Marginer />
              </BodyWrapper>
              <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
            </ContentWrapper>
          )}
        </>
      )}
    </Suspense>
  )
}
