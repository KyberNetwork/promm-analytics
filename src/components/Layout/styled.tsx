/* eslint-disable react/prop-types */

import React from 'react'
import styled from 'styled-components'
import { Link, LinkProps } from 'react-router-dom'
import { ExternalLink as ExternalLinkRaw } from 'theme'

const CustomLink = styled(Link)`
  display: flex;
  text-decoration: none;
  gap: 8px;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.subText};

  &[data-active='true'] {
    color: ${({ theme }) => theme.primary};
  }
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

type MenuItemProps = {
  isActive: boolean
  children?: React.ReactNode
} & LinkProps
export const MenuItem: React.FC<MenuItemProps> = ({ isActive, children, ...others }) => {
  return (
    <CustomLink data-active={isActive} {...others}>
      {children}
    </CustomLink>
  )
}

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
