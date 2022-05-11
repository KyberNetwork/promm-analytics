import React, { useRef } from 'react'
import { Menu as MenuIcon, TrendingUp, Disc, PieChart, Repeat, Activity } from 'react-feather'
import styled from 'styled-components'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal, useActiveNetworks } from 'state/application/hooks'

import { useLocation } from 'react-router-dom'
import { networkPrefix } from 'utils/networkPrefix'
import { MenuItem, ExternalMenu, Divider, ExternalLink } from '../styled'
import ThemeToggle from 'components/ThemeToggle'
import SocialLinks from 'components/SocialLinks'
import Wallet from 'components/Icons/Wallet'

const StyledMenuIcon = styled(MenuIcon)`
  stroke: ${({ theme }) => theme.text};
`

const StyledMenuButton = styled.button`
  border: none;
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.buttonBlack};

  border-radius: 0.25rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    opacity: 0.8;
  }
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.background};
  filter: drop-shadow(rgba(0, 0, 0, 0.36) 0px 4px 12px);
  border-radius: 8px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  bottom: 48px;
  right: 0rem;
  z-index: 100;
  width: max-content;
  gap: 20px;
`

export default function Menu() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggle : undefined)
  const { pathname } = useLocation()
  const activeNetworks = useActiveNetworks()[0]

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout>
          {/* <MenuItem to="/" isActive={pathname === '/'}>
            <TrendingUp size={16} />
            Summary
          </MenuItem>

          <MenuItem to={networkPrefix(activeNetworks) + 'tokens'} isActive={pathname.includes('tokens')}>
            <Disc size={16} />
            Tokens
          </MenuItem>

          <MenuItem to={networkPrefix(activeNetworks) + 'pools'} isActive={pathname.includes('pools')}>
            <PieChart size={16} />
            Pools
          </MenuItem>
 */}
          <MenuItem to={networkPrefix(activeNetworks) + 'accounts'} isActive={pathname.includes('account')}>
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
            Classic Analytics
          </ExternalMenu>

          <Divider />

          <div>
            <ThemeToggle />
            <SocialLinks />
            <ExternalLink href="https://kyber.network">KyberNetwork</ExternalLink>
          </div>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
