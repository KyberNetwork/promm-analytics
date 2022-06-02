import React, { HTMLProps, useCallback } from 'react'
import ReactGA from 'react-ga'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { darken } from 'polished'
import { ArrowLeft, X, ExternalLink as LinkIconFeather, Trash } from 'react-feather'

export const ButtonText = styled.button`
  outline: none;
  border: none;
  font-size: inherit;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;

  :hover {
    opacity: 0.7;
  }
`

// An internal link from the react-router-dom library that is correctly styled
export const StyledInternalLink = styled(Link)<{ fontSize?: string }>`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  font-size: ${({ fontSize }) => fontSize ?? '16px'};

  :hover {
    text-decoration: none;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }
`

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  display: inline;
  flex-direction: center;
  align-items: center;
  display: flex;

  :hover {
    text-decoration: underline;
    text-decoration: none;
    opacity: 0.7;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    outline: none;
    text-decoration: none;
  }
`

const LinkIconWrapper = styled.a`
  text-decoration: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;

  :hover {
    text-decoration: none;
    opacity: 0.7;
  }

  :focus {
    outline: none;
    text-decoration: none;
  }

  :active {
    text-decoration: none;
  }
`

export const LinkIcon = styled(LinkIconFeather)`
  height: 16px;
  width: 18px;
  margin-left: 10px;
  stroke: ${({ theme }) => theme.blue1};
`

export const TrashIcon = styled(Trash)`
  height: 16px;
  width: 18px;
  margin-left: 10px;
  stroke: ${({ theme }) => theme.text3};

  cursor: pointer;
  align-items: center;
  justify-content: center;
  display: flex;

  :hover {
    opacity: 0.7;
  }
`

const rotateImg = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }

  100% {
    transform: perspective(1000px) rotateY(360deg);
  }
`

export const UniTokenAnimated = styled.img`
  animation: ${rotateImg} 5s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  padding: 2rem 0 0 0;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15));
`

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }): JSX.Element {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        event.stopPropagation()
        ReactGA.outboundLink({ label: href }, () => {
          console.debug('Fired outbound link event', href)
        })
      } else {
        event.stopPropagation()
        event.preventDefault()
        // send a ReactGA event and then trigger a location change
        ReactGA.outboundLink({ label: href }, () => {
          window.location.href = href
        })
      }
    },
    [href, target]
  )
  return <StyledLink target={target} rel={rel} href={href} onClick={handleClick} {...rest} />
}

export const OnlyMedium = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: block
  `};
`

export const HideMedium = styled.span`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

export const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

export const HideExtraSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const ExtraSmallOnly = styled.span`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
  `};
`
