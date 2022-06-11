import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { ExternalLink as ExternalLinkRaw } from 'theme'

export const MenuItem = styled(Link)<{ isActive: boolean }>`
  display: flex;
  text-decoration: none;
  gap: 8px;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme, isActive }) => (isActive ? theme.primary : theme.subText)};
  @media (hover: hover) {
    :hover {
      color: ${({ theme }) => theme.text};
    }
  }
  svg {
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
    `}
  }
`

export const ExternalMenu = styled(ExternalLinkRaw)`
  display: flex;
  text-decoration: none;
  gap: 8px;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.subText};
  :hover {
    color: ${({ theme }) => theme.text};
  }
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.border};
`

export const KyberNetworkLink = styled(ExternalLinkRaw)`
  margin-top: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
  :hover {
    color: ${({ theme }) => theme.text};
  }
`
