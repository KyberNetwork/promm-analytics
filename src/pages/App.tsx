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
import { useSubgraphStatus } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import SideNav from 'components/Layout/SideNav'
import KyberLoading from 'components/Loader/KyberLoading'
import { Flex } from 'rebass'
import PinnedData from 'components/PinnedData'
import AccountsOverview from './Accounts/AccountsOverview'
import AccountPage from './Accounts/AccountPage'
import { ChainId, NETWORKS_INFO_LIST, NETWORKS_INFO_MAP } from 'constants/networks'
import { updateActiveNetwork } from 'state/application/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { ALL_CHAIN_ID } from 'constants/index'

const Announcement = styled.div`
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  righ: 0;
  padding: 10px 12px 10px 20px;
  background-color: #ff9901;
  display: flex;
  gap: 8px;
  font-size: 14px;
`

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
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  > * {
    max-width: 1440px;
  }

  @media (max-width: 1080px) {
    padding-top: 64px;
    margin-top: 0;
  }

  @media (max-width: 500px) {
    padding-top: 130px;
    margin-top: 0;
  }

  @media (max-width: 400px) {
    padding-top: 140px;
    margin-top: 0;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`

// const Hide1080 = styled.div`
//   @media (max-width: 1080px) {
//     display: none;
//   }
// `

// const WarningWrapper = styled.div`
//   width: 100%;
//   display: flex;
//   justify-content: center;
// `

// const WarningBanner = styled.div`
//   background-color: ${({ theme }) => theme.bg3};
//   padding: 1rem;
//   color: white;
//   font-size: 14px;
//   width: 100%;
//   text-align: center;
//   font-weight: 500;
// `

// const BLOCK_DIFFERENCE_THRESHOLD = 30

const NetworkReader: React.FunctionComponent<React.PropsWithChildren<any>> = ({ children }) => {
  const { networkID: currentNetworkURL } = useParams<{ networkID: string }>()

  const networkInfoFromURL = NETWORKS_INFO_LIST.find((networkInfo) => networkInfo.route === currentNetworkURL)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!currentNetworkURL) {
      dispatch(updateActiveNetwork({ chainId: ALL_CHAIN_ID }))
    } else if (networkInfoFromURL) {
      dispatch(updateActiveNetwork({ chainId: networkInfoFromURL.chainId || ALL_CHAIN_ID }))
    }
  }, [currentNetworkURL, networkInfoFromURL, dispatch])
  const homeLink = `/${NETWORKS_INFO_MAP[ChainId.ETHEREUM].route}/home`

  if (networkInfoFromURL?.chainId === ChainId.AURORA) return <Redirect to={homeLink} /> //not support Aurora yet
  return children
}

export const AppRoutes = [
  { path: '/:networkID?/pools', element: (): JSX.Element => <PoolsOverview /> },
  { path: '/:networkID?/pool/:address', element: (): JSX.Element => <PoolPage /> },
  { path: '/:networkID?/tokens', element: (): JSX.Element => <TokensOverview /> },
  { path: '/:networkID?/token/:address', element: (): JSX.Element => <RedirectInvalidToken /> },
  { path: '/:networkID?/accounts', element: (): JSX.Element => <AccountsOverview /> },
  { path: '/:networkID?/account/:address', element: (): JSX.Element => <AccountPage /> },
  { path: '/:networkID?/home', element: (): JSX.Element => <Home />, strict: false },
]

export default function App(): JSX.Element {
  const [savedOpen, setSavedOpen] = useState(false)
  // pretend load buffer
  // pretend load buffer
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  // const activeNetwork = useActiveNetworks()
  // subgraph health
  const [subgraphStatus] = useSubgraphStatus()

  // const showNotSyncedWarning =
  //   subgraphStatus.headBlock && subgraphStatus.syncedBlock
  //     ? subgraphStatus.headBlock - subgraphStatus.syncedBlock > BLOCK_DIFFERENCE_THRESHOLD
  //     : false

  return (
    <Suspense fallback={null}>
      <Announcement>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ minWidth: '24px' }}
        >
          <path
            d="M18 12C18 12.55 18.45 13 19 13H21C21.55 13 22 12.55 22 12C22 11.45 21.55 11 21 11H19C18.45 11 18 11.45 18 12Z"
            fill="currentColor"
          ></path>
          <path
            d="M16.59 16.8199C16.26 17.2599 16.35 17.8699 16.79 18.1899C17.32 18.5799 17.88 18.9999 18.41 19.3999C18.85 19.7299 19.47 19.6399 19.79 19.1999C19.79 19.1899 19.8 19.1899 19.8 19.1799C20.13 18.7399 20.04 18.1199 19.6 17.7999C19.07 17.3999 18.51 16.9799 17.99 16.5899C17.55 16.2599 16.93 16.3599 16.6 16.7999C16.6 16.8099 16.59 16.8199 16.59 16.8199Z"
            fill="currentColor"
          ></path>
          <path
            d="M19.8101 4.81004C19.8101 4.80004 19.8001 4.80004 19.8001 4.79004C19.4701 4.35004 18.8501 4.26005 18.4201 4.59005C17.8901 4.99005 17.3201 5.41004 16.8001 5.81004C16.3601 6.14004 16.2801 6.76005 16.6101 7.19005C16.6101 7.20005 16.6201 7.20005 16.6201 7.21005C16.9501 7.65005 17.5601 7.74004 18.0001 7.41004C18.5301 7.02004 19.0901 6.59004 19.6201 6.19004C20.0501 5.87004 20.1301 5.25004 19.8101 4.81004Z"
            fill="currentColor"
          ></path>
          <path
            d="M8 9H4C2.9 9 2 9.9 2 11V13C2 14.1 2.9 15 4 15H5V18C5 18.55 5.45 19 6 19C6.55 19 7 18.55 7 18V15H8L13 18V6L8 9Z"
            fill="currentColor"
          ></path>
          <path
            d="M15.5 11.9999C15.5 10.6699 14.92 9.4699 14 8.6499V15.3399C14.92 14.5299 15.5 13.3299 15.5 11.9999Z"
            fill="currentColor"
          ></path>
        </svg>

        <div>
          <strong>Attention KyberSwap Elastic Liquidity Providers:</strong>
          <div>
            We have identified a potential vulnerability, and as a precaution we advise all Liquidity Providers to
            withdraw your funds on Elastic as soon as possible. KyberSwap Classic remains unaffected. Investigations are
            ongoing and no user funds are lost. We will provide further details on the situation shortly and announce
            when KyberSwap Elastic is re-enabled. We apologise for the inconvenience caused.
          </div>
        </div>
      </Announcement>
      <Route component={DarkModeQueryParamReader} />
      {loading ? (
        <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center">
          <KyberLoading />
        </Flex>
      ) : (
        <>
          {subgraphStatus.available === false ? (
            <BodyWrapper>
              <DarkGreyCard style={{ maxWidth: '340px' }}>
                <TYPE.label>
                  The Graph hosted network which provides data for this site is temporarily experiencing issues. Check
                  current status{' '}
                  <ExternalLink href="https://thegraph.com/hosted-service/subgraph/kybernetwork/kyberswap-elastic-mainet">
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
                  {AppRoutes.map((item) => (
                    <Route
                      key={item.path}
                      exact
                      strict={item.strict ?? true}
                      path={item.path}
                      render={() => <NetworkReader>{item.element()}</NetworkReader>}
                    />
                  ))}
                  <Route path="/:networkID" render={() => <RedirectToHome />} />
                  <Route path="*" render={() => <RedirectToHome />} />
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

const RedirectToHome = () => {
  const { networkID: currentNetworkURL } = useParams<{ networkID: string }>()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''

  return <Redirect to={prefixNetworkURL + '/home'} />
}
