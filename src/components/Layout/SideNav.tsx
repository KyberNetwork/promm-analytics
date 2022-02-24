import React, { useState } from 'react'
import styled from 'styled-components'
import ProMMAnalyticsLogo from 'assets/svg/kyberswap_promm_analytics_logo.svg'
import ProMMAnalyticsLogoLight from 'assets/svg/kyberswap_promm_analytics_logo_light.svg'
import SwitchNetWorkIcon from 'assets/svg/switch-network.svg'
import { Text, Flex } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useActiveNetworkVersion } from 'state/application/hooks'
import QuestionHelper from 'components/QuestionHelper'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, Repeat, Activity, X } from 'react-feather'
import { networkPrefix } from 'utils/networkPrefix'
import ThemeToggle from 'components/ThemeToggle'
import SocialLinks from 'components/SocialLinks'
import { MEDIA_WIDTHS, StyledInternalLink } from 'theme'
import { useWindowSize } from 'hooks/useWindowSize'
import Menu from './Menu'
import { ExternalLink, MenuItem, Divider, ExternalMenu } from './styled'
import Modal from 'components/Modal'
import { ButtonEmpty } from 'components/Button'
import { SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'
import { useDarkModeManager } from 'state/user/hooks'

const NetworkModalContent = styled.div`
  width: 100%;
  padding: 28px 24px;
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
  padding: 32px 24px;
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
  padding: 12px 16px;
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
  background: ${({ theme }) => theme.buttonBlack};
  display: flex;
  width: 100%;
  margin-top: 24px;
`
const TabItem = styled.div<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  background: ${({ theme, active }) => (!active ? theme.buttonBlack : theme.primary)};
  color: ${({ theme, active }) => (active ? theme.textReverse : theme.subText)};
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
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

function SideNav() {
  const theme = useTheme()
  const [activeNetwork] = useActiveNetworkVersion()
  const { pathname } = useLocation()
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [tab, setTab] = useState<1 | 2>(1)
  const [isDarkMode] = useDarkModeManager()

  const { width } = useWindowSize()

  const hideNav = width && width <= MEDIA_WIDTHS.upToLarge

  const networkModal = (
    <Modal onDismiss={() => setShowNetworkModal(false)} isOpen={showNetworkModal} maxWidth={624}>
      <NetworkModalContent>
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Text fontSize={20} fontWeight="500">
            Select a Network
          </Text>
          <ButtonEmpty width="fit-content" onClick={() => setShowNetworkModal(false)}>
            <X color={theme.text} />
          </ButtonEmpty>
        </Flex>

        <TabWrapper>
          <TabItem active={tab === 1} onClick={() => setTab(1)} role="button">
            V2 Analytics
          </TabItem>
          <TabItem active={tab === 2} onClick={() => setTab(2)} role="button">
            V1 Analytics
          </TabItem>
        </TabWrapper>

        <NetworkList>
          {SUPPORTED_NETWORK_VERSIONS.map((network) => (
            <StyledInternalLink key={network.id} to={`/${network.route}/`}>
              <NetworkItem
                active={tab === 1 && network.id === activeNetwork.id}
                key={network.id}
                onClick={() => setShowNetworkModal(false)}
              >
                <img src={network.imageURL} width="24px" height="24px" alt={network.name} />
                <Text>{network.name}</Text>
              </NetworkItem>
            </StyledInternalLink>
          ))}
        </NetworkList>
      </NetworkModalContent>
    </Modal>
  )

  if (hideNav) {
    return (
      <>
        {networkModal}
        <Header>
          <Link to="/">
            <img src={isDarkMode ? ProMMAnalyticsLogo : ProMMAnalyticsLogoLight} alt="Logo" width="110px" />
          </Link>

          <Flex alignItems="center" sx={{ gap: width && width < MEDIA_WIDTHS.upToExtraSmall ? '16px' : '24px' }}>
            <MenuItem
              to={networkPrefix(activeNetwork)}
              active={pathname === '/' || pathname === networkPrefix(activeNetwork)}
            >
              <TrendingUp size={16} />
              Summary
            </MenuItem>

            <MenuItem to={networkPrefix(activeNetwork) + 'tokens'} active={pathname.includes('tokens')}>
              <Disc size={16} />
              Tokens
            </MenuItem>

            <MenuItem to={networkPrefix(activeNetwork) + 'pools'} active={pathname.includes('pools')}>
              <PieChart size={16} />
              Pools
            </MenuItem>
          </Flex>
        </Header>
        <Bottom>
          <SelectNetwork
            role="button"
            onClick={() => {
              setShowNetworkModal(true)
            }}
          >
            <img src={activeNetwork.imageURL} width="20px" height="20px" alt={`${activeNetwork.name} Logo`} />
            <Text fontWeight="500" color={theme.primary} fontSize="1rem">
              {activeNetwork.name}
            </Text>
            <Flex flex={1} justifyContent="flex-end" alignItems="center" marginLeft="8px" marginTop="3px">
              <img src={SwitchNetWorkIcon} width="20px" />
            </Flex>
          </SelectNetwork>

          <Menu />
        </Bottom>
      </>
    )
  }

  return (
    <>
      {networkModal}
      <Wrapper>
        <div>
          <Link to="/">
            <img src={isDarkMode ? ProMMAnalyticsLogo : ProMMAnalyticsLogoLight} alt="Logo" width="100%" />
          </Link>
          <Flex marginTop="1.5rem" alignItems="flex-start" width="100%">
            <Text fontSize={16} fontWeight="500" color={theme.subText}>
              Select a network
            </Text>
            <QuestionHelper text="You can switch between networks in our V2 and V1 Analytics here" />
          </Flex>

          <SelectNetwork
            role="button"
            marginTop="1rem"
            onClick={() => {
              setShowNetworkModal(true)
            }}
          >
            <img src={activeNetwork.imageURL} width="20px" height="20px" alt={`${activeNetwork.name} Logo`} />
            <Text fontWeight="500" color={theme.primary} fontSize="1rem">
              {activeNetwork.name}
            </Text>
            <Flex flex={1} justifyContent="flex-end" alignItems="center" marginLeft="8px" marginTop="3px">
              <img src={SwitchNetWorkIcon} width="20px" />
            </Flex>
          </SelectNetwork>
          <MenuWrapper>
            <MenuItem
              to={networkPrefix(activeNetwork)}
              active={pathname === '/' || pathname === networkPrefix(activeNetwork)}
            >
              <TrendingUp size={16} />
              Summary
            </MenuItem>

            <MenuItem to={networkPrefix(activeNetwork) + 'tokens'} active={pathname.includes('tokens')}>
              <Disc size={16} />
              Tokens
            </MenuItem>

            <MenuItem to={networkPrefix(activeNetwork) + 'pools'} active={pathname.includes('pools')}>
              <PieChart size={16} />
              Pools
            </MenuItem>

            <Divider />

            <ExternalMenu href={'https://kyberswap.com'}>
              <Repeat size={16} />
              Swap
            </ExternalMenu>

            <ExternalMenu href={'https://analytics.kyberswap.com'}>
              <Activity size={16} />
              V1 Analytics
            </ExternalMenu>
          </MenuWrapper>
        </div>

        <div>
          <ThemeToggle />
          <SocialLinks />
          <ExternalLink href="https://kyber.network">KyberNetwork</ExternalLink>
        </div>
      </Wrapper>
    </>
  )
}

export default SideNav
