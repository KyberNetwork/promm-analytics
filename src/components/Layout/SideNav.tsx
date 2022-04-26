import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import ProMMAnalyticsLogo from 'assets/svg/kyberswap_promm_analytics_logo.svg'
import ProMMAnalyticsLogoLight from 'assets/svg/kyberswap_promm_analytics_logo_light.svg'
import SwitchNetWorkIcon from 'assets/svg/switch-network.svg'
import { Text, Flex } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
import QuestionHelper from 'components/QuestionHelper'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, Repeat, Activity, X } from 'react-feather'
import { activeNetworkPrefix } from 'utils/networkPrefix'
import ThemeToggle from 'components/ThemeToggle'
import SocialLinks from 'components/SocialLinks'
import { MEDIA_WIDTHS, StyledInternalLink } from 'theme'
import { useWindowSize } from 'hooks/useWindowSize'
import Menu from './Menu'
import { ExternalLink, MenuItem, Divider, ExternalMenu } from './styled'
import Modal from 'components/Modal'
import { ButtonEmpty } from 'components/Button'
import { NETWORKS_INFO_MAP, SHOW_NETWORKS } from 'constants/networks'
import { useDarkModeManager } from 'state/user/hooks'
import Wallet from 'components/Icons/Wallet'
import Kyber from '../../assets/svg/kyber.svg'

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

const LinkWrapper = styled.a`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
  color: ${({ theme }) => theme.subText};
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
  const activeNetworks = useActiveNetworks()
  const { isAllChain } = useActiveNetworkUtils()
  return (
    <SelectNetwork role="button" onClick={onClick} marginTop={marginTop}>
      <img
        src={isAllChain ? Kyber : activeNetworks[0].imageURL}
        width="20px"
        height="20px"
        alt={`${isAllChain ? 'All Chain' : activeNetworks[0].name} Logo`}
      />
      <Text fontWeight="500" color={theme.primary} fontSize="1rem">
        {isAllChain ? 'All Chain' : activeNetworks[0].name}
      </Text>
      <Flex flex={1} justifyContent="flex-end" alignItems="center" marginLeft="8px" marginTop="3px">
        <img src={SwitchNetWorkIcon} width="20px" />
      </Flex>
    </SelectNetwork>
  )
}

function SideNav() {
  const theme = useTheme()
  const activeNetworks = useActiveNetworks() //todo namgold: useParams()
  const { isAllChain } = useActiveNetworkUtils()
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
            Analytics Elastic
          </TabItem>
          {/* <TabItem active={tab === 2} onClick={() => setTab(2)} role="button"> */}
          <TabItem active={tab === 2} role="button">
            <LinkWrapper href="https://analytics.kyberswap.com">Analytics Classic </LinkWrapper>
            {/* todo namgold: disable link styling */}
          </TabItem>
        </TabWrapper>

        <NetworkList>
          {SHOW_NETWORKS.map((chainId) => (
            <StyledInternalLink key={chainId} to={`/${NETWORKS_INFO_MAP[chainId].route}/home`}>
              <NetworkItem
                active={!isAllChain && tab === 1 && chainId === activeNetworks[0].chainId}
                key={chainId}
                onClick={() => setShowNetworkModal(false)}
              >
                <img
                  src={NETWORKS_INFO_MAP[chainId].imageURL}
                  width="24px"
                  height="24px"
                  alt={NETWORKS_INFO_MAP[chainId].name}
                />
                <Text>{NETWORKS_INFO_MAP[chainId].name}</Text>
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
            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'home'} isActive={pathname.endsWith('home')}>
              <TrendingUp size={16} />
              Summary
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'tokens'} isActive={pathname.includes('token')}>
              <Disc size={16} />
              Tokens
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'pools'} isActive={pathname.includes('pool')}>
              <PieChart size={16} />
              Pools
            </MenuItem>
          </Flex>
        </Header>
        <Bottom>
          <SelectNetworkButton onClick={() => setShowNetworkModal(true)} />
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
              <PieChart size={16} />
              Pools
            </MenuItem>

            <MenuItem to={activeNetworkPrefix(activeNetworks) + 'accounts'} isActive={pathname.includes('account')}>
              <Wallet />
              Wallet Analytics
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
