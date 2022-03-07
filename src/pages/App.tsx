import React, { Suspense, useState, useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Home from './Home'
import PoolsOverview from './Pool/PoolsOverview'
import TokensOverview from './Token/TokensOverview'
import { RedirectInvalidToken } from './Token/redirects'
import PoolPage from './Pool/PoolPage'
import { ExternalLink, TYPE } from 'theme'
import { useActiveNetworkVersion, useSubgraphStatus } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import { SUPPORTED_NETWORK_VERSIONS, EthereumNetworkInfo, OptimismNetworkInfo } from 'constants/networks'
import SideNav from 'components/Layout/SideNav'
import Loading from 'components/Loader/Loading'
import { Flex } from 'rebass'

const ContentWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 208px 1fr;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr;
  `}
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
  margin-top: 28px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  > * {
    max-width: 1280px;
  }

  @media (max-width: 1080px) {
    padding-top: 2rem;
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

export default function App() {
  // pretend load buffer
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 1300)
  }, [])

  // update network based on route
  // TEMP - find better way to do this
  const location = useLocation()
  const [activeNetwork, setActiveNetwork] = useActiveNetworkVersion()
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveNetwork(EthereumNetworkInfo)
    } else {
      SUPPORTED_NETWORK_VERSIONS.map((n) => {
        if (location.pathname.includes(n.route.toLocaleLowerCase())) {
          setActiveNetwork(n)
        }
      })
    }
  }, [location.pathname, setActiveNetwork])

  // subgraph health
  const [subgraphStatus] = useSubgraphStatus()

  const showNotSyncedWarning =
    subgraphStatus.headBlock && subgraphStatus.syncedBlock && activeNetwork === OptimismNetworkInfo
      ? subgraphStatus.headBlock - subgraphStatus.syncedBlock > BLOCK_DIFFERENCE_THRESHOLD
      : false

  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      {loading ? (
        <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center">
          <Loading />
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
            <ContentWrapper>
              <SideNav />
              <BodyWrapper>
                <Popups />
                <Switch>
                  <Route exact strict path="/:networkID?/pools/:address" component={PoolPage} />
                  <Route exact strict path="/:networkID?/pools" component={PoolsOverview} />
                  <Route exact strict path="/:networkID?/tokens/:address" component={RedirectInvalidToken} />
                  <Route exact strict path="/:networkID?/tokens" component={TokensOverview} />
                  <Route exact path="/:networkID?" component={Home} />
                </Switch>
                <Marginer />
              </BodyWrapper>
            </ContentWrapper>
          )}
        </>
      )}
    </Suspense>
  )
}
