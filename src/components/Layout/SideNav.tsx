import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Text, Flex } from 'rebass'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import { TrendingUp, Disc, Repeat, Activity, X, Droplet } from 'react-feather'

import Kyber from 'assets/svg/kyber.svg'
import KyberBlack from 'assets/svg/kyber-black.svg'
import ProMMAnalyticsLogo from 'assets/svg/logo_dark.svg'
import ProMMAnalyticsLogoLight from 'assets/svg/logo_light.svg'
import SwitchNetWorkIcon from 'assets/svg/switch-network.svg'
import {
  ChainIdType,
  CLASSIC_SUPPORTED_NETWORKS,
  ELASTIC_LEGACY_SUPPORTED_NETWORKS,
  ELASTIC_SUPPORTED_NETWORKS,
  NETWORKS_INFO_LIST,
  NETWORKS_INFO_MAP,
} from 'constants/networks'
import { UnSelectable } from 'components'
import SocialLinks from 'components/SocialLinks'
import { InfoHelper } from 'components/QuestionHelper'
import ThemeToggle from 'components/ThemeToggle'
import Modal from 'components/Modal'
import Wallet from 'components/Icons/Wallet'
import { useWindowSize } from 'hooks/useWindowSize'
import { ButtonEmpty } from 'components/Button'
import Menu from './Menu'
import { KyberNetworkLink, MenuItem, Divider, ExternalMenu } from './styled'
import useTheme from 'hooks/useTheme'
import { useSessionStart } from 'hooks/useSectionStart'
import { useDarkModeManager, useIsFirstTimeVisit } from 'state/user/hooks'
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
import { activeNetworkPrefix } from 'utils/networkPrefix'
import { MEDIA_WIDTHS, StyledInternalLink, StyledLink } from 'theme'
import { generateSwapURL } from 'utils'
import { ALL_CHAIN_ID } from 'constants/index'
import { rgba } from 'polished'
import { toggleLegacyMode } from 'state/user/actions'
import { useAppDispatch, useAppSelector } from 'hooks/useAppDispatch'

const NetworkModalContent = styled.div`
  width: 100%;
  padding: 30px 22px 28px 24px;
`

const Wrapper = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  background: ${({ theme }) => theme.background};
  padding: 32px 24px 28px;
`

const SelectNetwork = styled(Flex)`
  background: ${({ theme }) => theme.buttonBlack};
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 1rem;
  gap: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 32px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.background};
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: rgba(27, 31, 35, 0.04) 0px 1px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px inset;
`

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16.5px 16px;
  background: ${({ theme }) => theme.background};
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
`

const TabWrapper = styled.div`
  border-radius: 999px;
  display: flex;
  width: 100%;
  margin-top: 24px;
  gap: 8px;
`
const TabItem = styled.div<{ active?: boolean }>`
  flex: 4;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  border: 1px solid ${({ theme, active }) => (active ? 'transparent' : theme.border)};
  background: ${({ theme, active }) => (!active ? 'transparent' : rgba(theme.primary, 0.3))};
  color: ${({ theme, active }) => (active ? theme.primary : theme.subText)};
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
`

const LegacyTag = styled.div`
  font-size: 12px;
  border-radius: 999px;
  padding: 2px 8px;
  font-weight: 500;
  line-height: 16px;
  background: ${({ theme }) => rgba(theme.subText, 0.2)};
`

const NetworkList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  row-gap: 20px;
  column-gap: 24px;
  margin-top: 28px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
  `}
`

const NetworkItem = styled.div<{ active: boolean }>`
  cursor: pointer;
  background: ${({ theme, active }) => (!active ? theme.buttonBlack : theme.primary)};
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-weight: 500;
  color: ${({ theme, active }) => (active ? theme.textReverse : theme.subText)};
`

const DMMIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const ZIndex100 = styled.div`
  z-index: 100;
`

const Polling = styled.div`
  display: flex;
  padding: 0.75rem 0;
  font-size: 10px;
  color: ${({ theme }) => theme.subText};
  transition: opacity 0.25s ease;

  a {
    color: ${({ theme }) => theme.subText};
  }
`

const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

type SelectNetworkButtonPropType = {
  onClick: React.MouseEventHandler
  marginTop?: string
}

const SelectNetworkButton: React.FunctionComponent<SelectNetworkButtonPropType> = ({
  onClick,
  marginTop,
}: SelectNetworkButtonPropType) => {
  const theme = useTheme()
  const { isAllChain, networkInfo } = useActiveNetworkUtils()
  return (
    <SelectNetwork role="button" onClick={onClick} marginTop={marginTop}>
      <img
        src={isAllChain ? Kyber : networkInfo.imageURL}
        width="20px"
        height="20px"
        alt={`${isAllChain ? 'All Chains' : networkInfo.name} Logo`}
      />
      <Text
        fontWeight="500"
        color={theme.primary}
        fontSize="1rem"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginRight: '2px',
        }}
      >
        {isAllChain ? 'All Chains' : networkInfo.name}
      </Text>
      <Flex flex={1} justifyContent="flex-end" alignItems="center" marginLeft="8px" marginTop="3px">
        <img src={SwitchNetWorkIcon} width="20px" />
      </Flex>
    </SelectNetwork>
  )
}

enum ListTabs {
  ELASTIC = 'Elastic',
  ELASTIC_LEGACY = 'Elastic Legacy',
  CLASSIC = 'Classic',
}

function SideNav(): JSX.Element {
  const theme = useTheme()
  const activeNetworks = useActiveNetworks()
  const { isAllChain, networkInfo } = useActiveNetworkUtils()

  const { pathname } = useLocation()
  const [showNetworkModal, setShow] = useState(false)
  const [isFirstTimeVisit, toggleFirstTimeVisit] = useIsFirstTimeVisit()
  const { width } = useWindowSize()
  const history = useHistory()
  const seconds = useSessionStart()

  const setShowNetworkModal = useCallback(
    (isShow: boolean) => {
      if (!isShow) {
        toggleFirstTimeVisit()
      }
      setShow(isShow)
    },
    [toggleFirstTimeVisit]
  )

  useEffect(() => {
    if ((isFirstTimeVisit || isFirstTimeVisit === undefined) && history.location.pathname.includes('home')) {
      setShowNetworkModal(true)
    }
  }, [history, isFirstTimeVisit, setShowNetworkModal])
  const { networkID: currentNetworkURL } = useParams<{ networkID: string }>()
  const prefixNetworkURL = currentNetworkURL ? `/${currentNetworkURL}` : ''
  const below1080 = useMedia('(max-width: 1080px)')
  const [isDark] = useDarkModeManager()
  const isLegacyMode = useAppSelector((state) => !!state.user.legacyMode)
  const [tab, setTab] = useState<ListTabs>(() => (isLegacyMode ? ListTabs.ELASTIC_LEGACY : ListTabs.ELASTIC))
  const hideNav = width && width <= MEDIA_WIDTHS.upToLarge

  const networkListToShow: ChainIdType[] = (() => {
    switch (tab) {
      case ListTabs.CLASSIC:
        return CLASSIC_SUPPORTED_NETWORKS
      case ListTabs.ELASTIC:
        return ELASTIC_SUPPORTED_NETWORKS
      case ListTabs.ELASTIC_LEGACY:
        return ELASTIC_LEGACY_SUPPORTED_NETWORKS
    }
  })()

  const currentPage =
    '/' +
    pathname
      .split('/')
      .slice(NETWORKS_INFO_LIST.map((network) => network.route).includes(pathname.split('/')[1]) ? 2 : 1)
      .join('/')
  const newPage = currentPage.startsWith('/token/')
    ? '/tokens'
    : currentPage.startsWith('/pool/')
    ? '/pools'
    : currentPage.startsWith('/account/')
    ? '/accounts'
    : currentPage

  const dispatch = useAppDispatch()

  const networkModal = (
    <Modal onDismiss={() => setShowNetworkModal(false)} isOpen={showNetworkModal} maxWidth={624}>
      <NetworkModalContent>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text fontSize={16} fontWeight="500">
            Select a Chain
          </Text>
          <ButtonEmpty width="fit-content" onClick={() => setShowNetworkModal(false)} style={{ padding: 0 }}>
            <X size={16} color={theme.text} />
          </ButtonEmpty>
        </Flex>

        <TabWrapper>
          <TabItem active={tab === ListTabs.ELASTIC} role="button" onClick={() => setTab(ListTabs.ELASTIC)}>
            Elastic Analytics
          </TabItem>
          <TabItem
            active={tab === ListTabs.ELASTIC_LEGACY}
            role="button"
            onClick={() => setTab(ListTabs.ELASTIC_LEGACY)}
            style={{ flex: 5 }}
          >
            Elastic Analytics <LegacyTag>Legacy</LegacyTag>
          </TabItem>

          <TabItem active={tab === ListTabs.CLASSIC} role="button" onClick={() => setTab(ListTabs.CLASSIC)}>
            Classic Analytics
          </TabItem>
        </TabWrapper>

        <NetworkList>
          {networkListToShow.map((chainId: ChainIdType) => {
            const isAllChainId = chainId === ALL_CHAIN_ID
            return tab === ListTabs.CLASSIC ? (
              <StyledLink
                key={chainId}
                href={`/classic/${isAllChainId ? '' : NETWORKS_INFO_MAP[chainId].route + '/'}home`}
              >
                <NetworkItem
                  active={isAllChain ? isAllChainId : chainId === networkInfo.chainId}
                  key={chainId}
                  onClick={() => setShowNetworkModal(false)}
                >
                  <img
                    src={isAllChainId ? (isAllChain ? KyberBlack : Kyber) : NETWORKS_INFO_MAP[chainId].imageURL}
                    width="24px"
                    height="24px"
                    alt={isAllChainId ? 'All Chains' : NETWORKS_INFO_MAP[chainId].name}
                  />
                  <Text
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isAllChainId ? 'All Chains' : NETWORKS_INFO_MAP[chainId].name}
                  </Text>
                </NetworkItem>
              </StyledLink>
            ) : (
              <StyledInternalLink
                key={chainId}
                to={`${isAllChainId ? '' : '/' + NETWORKS_INFO_MAP[chainId].route}${newPage}`}
                onClick={() => {
                  if (
                    (isLegacyMode && tab === ListTabs.ELASTIC) ||
                    (!isLegacyMode && tab === ListTabs.ELASTIC_LEGACY)
                  ) {
                    dispatch(toggleLegacyMode())
                    window.location.href = window.location.origin
                  }
                }}
              >
                <NetworkItem
                  active={isAllChain ? isAllChainId : chainId === networkInfo.chainId}
                  key={chainId}
                  onClick={() => setShowNetworkModal(false)}
                >
                  <img
                    src={isAllChainId ? (isAllChain ? KyberBlack : Kyber) : NETWORKS_INFO_MAP[chainId].imageURL}
                    width="24px"
                    height="24px"
                    alt={isAllChainId ? 'All Chains' : NETWORKS_INFO_MAP[chainId].name}
                  />
                  <Text
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isAllChainId ? 'All Chains' : NETWORKS_INFO_MAP[chainId].name}
                  </Text>
                </NetworkItem>
              </StyledInternalLink>
            )
          })}
        </NetworkList>
      </NetworkModalContent>
    </Modal>
  )

  if (hideNav) {
    return (
      <ZIndex100>
        {networkModal}
        <Header>
          <div>
            <DMMIcon id="link" to={prefixNetworkURL}>
              <img
                width={below1080 ? '110px' : '160px'}
                src={isDark ? ProMMAnalyticsLogo : ProMMAnalyticsLogoLight}
                alt="logo"
                style={{ marginTop: '2px' }}
              />
            </DMMIcon>
            <UnSelectable>
              <Text fontSize="10px" color={theme.subText} textAlign="right" marginTop="-12px">
                Elastic Analytics
              </Text>
            </UnSelectable>
          </div>

          <Flex alignItems="center" sx={{ gap: width && width < MEDIA_WIDTHS.upToExtraSmall ? '16px' : '24px' }}>
            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'home'} isActive={pathname.endsWith('home')}>
              <TrendingUp size={16} />
              Summary
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'tokens'} isActive={pathname.includes('token')}>
              <Disc size={16} />
              Tokens
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'pools'} isActive={pathname.includes('pool')}>
              <Droplet size={16} />
              Pools
            </MenuItem>
          </Flex>
        </Header>
        <Bottom>
          <SelectNetworkButton onClick={() => setShowNetworkModal(true)} />
          <Menu />
        </Bottom>
      </ZIndex100>
    )
  }

  return (
    <>
      {networkModal}
      <Wrapper>
        <div>
          <div>
            <DMMIcon id="link" to={prefixNetworkURL}>
              <img
                width={below1080 ? '110px' : '160px'}
                src={isDark ? ProMMAnalyticsLogo : ProMMAnalyticsLogoLight}
                alt="logo"
                style={{ marginTop: '2px' }}
              />
            </DMMIcon>
            <UnSelectable>
              <Text fontSize="12px" color={theme.subText} textAlign="right" marginTop="-12px">
                Elastic {isLegacyMode ? 'Legacy' : 'Analytics'}
              </Text>
            </UnSelectable>
          </div>
          <Flex marginTop="1.5rem" alignItems="flex-start" width="100%">
            <Text fontSize={16} fontWeight="500" color={theme.subText}>
              Select a chain
            </Text>
            <InfoHelper text="You can switch between networks in our Elastic Analytics, Elastic Analytics (Legacy) and Classic Analytics below" />
          </Flex>

          <SelectNetworkButton onClick={() => setShowNetworkModal(true)} marginTop="1rem" />

          <MenuWrapper>
            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'home'} isActive={pathname.endsWith('home')}>
              <TrendingUp size={16} />
              Summary
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'tokens'} isActive={pathname.includes('token')}>
              <Disc size={16} />
              Tokens
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'pools'} isActive={pathname.includes('pool')}>
              <Droplet size={16} />
              Pools
            </MenuItem>

            {!isAllChain && (
              <MenuItem to={activeNetworkPrefix(activeNetworks) + 'accounts'} isActive={pathname.includes('account')}>
                <Wallet />
                Wallet Analytics
              </MenuItem>
            )}

            <Divider />

            <ExternalMenu href={generateSwapURL(isAllChain ? undefined : networkInfo)}>
              <Repeat size={16} />
              Swap
            </ExternalMenu>

            <ExternalMenu href="/classic">
              <Activity size={16} />
              Classic Analytics
            </ExternalMenu>
          </MenuWrapper>
        </div>

        <div>
          <ThemeToggle />
          <SocialLinks />
          <KyberNetworkLink href="https://kyber.network">Kyber Network</KyberNetworkLink>
          <Polling>
            <PollingDot />
            <a href="/elastic" style={{ textDecoration: 'none' }}>
              Updated {seconds ? seconds + 's' : '-'} ago <br />
            </a>
          </Polling>
        </div>
      </Wrapper>
    </>
  )
}

export default SideNav
