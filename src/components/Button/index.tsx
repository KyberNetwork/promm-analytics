import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { darken, transparentize } from 'polished'

import { RowBetween } from '../Row'
import { ChevronDown, ChevronUp, Bookmark } from 'react-feather'
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import { StyledIcon } from 'components'

const Base = styled(RebassButton)<{
  padding?: string
  width?: string
  altDisabledStyle?: boolean
}>`
  padding: ${({ padding }) => (padding ? padding : '10px 16px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-size: 14px;
  padding: 12px 10px;
  border-radius: 9999px;
  font-weight: 500;
  text-align: center;
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`

export const ButtonDark = styled(Base)<{ color?: string }>`
  background-color: ${({ color, theme }) => (color ? color : theme.primary)};
  color: ${({ theme }) => theme.textReverse};
  min-width: fit-content;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;

  :hover {
    background-color: ${({ color, theme }) => (color ? darken(0.1, color) : darken(0.1, theme.primary))};
  }
`

export const ButtonPrimary = styled(Base)`
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.textReverse};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary)};
    background-color: ${({ theme }) => darken(0.05, theme.primary)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary)};
    background-color: ${({ theme }) => darken(0.1, theme.primary)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle ? (disabled ? theme.bg3 : theme.primary) : theme.bg3};
    color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle ? (disabled ? theme.text3 : 'white') : theme.text3};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.5' : '1')};
  }
`

export const ButtonLight = styled(Base)<{ color?: string }>`
  background-color: ${({ color, theme }) => (color ? transparentize(0.9, color) : transparentize(0.9, theme.primary1))};
  color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};

  min-width: fit-content;
  border-radius: 4px;
  white-space: nowrap;

  a {
    color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};
  }

  :hover {
    background-color: ${({ color, theme }) =>
      color ? transparentize(0.8, color) : transparentize(0.8, theme.primary1)};
  }
`

export const ButtonOutlined = styled(Base)`
  border: 1px solid ${({ theme }) => theme.primary};
  background-color: transparent;
  color: ${({ theme }) => theme.primary};

  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.textReverse};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  padding: 11px 22px;
  border-radius: 9999px;
`

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonFaded = styled(Base)`
  background-color: ${({ theme }) => theme.bg2};
  color: (255, 255, 255, 0.5);
  white-space: nowrap;
  padding: 8px 12px;
  :hover {
    opacity: 0.5;
  }
`

export function ButtonDropdown({
  disabled = false,
  children,
  open,
  ...rest
}: { disabled?: boolean } & ButtonProps): JSX.Element {
  return (
    <ButtonFaded {...rest} disabled={disabled} ope={open}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        {open ? (
          <StyledIcon>
            <ChevronUp size={24} />
          </StyledIcon>
        ) : (
          <StyledIcon>
            <ChevronDown size={24} />
          </StyledIcon>
        )}
      </RowBetween>
    </ButtonFaded>
  )
}

export const OptionButton = styled.div<{ active?: boolean; disabled?: boolean }>`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${({ active, theme }) => (active ? theme.primary : theme.buttonBlack)};
  color: ${({ theme, active }) => (active ? theme.white : theme.text)};

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }
`

const HoverIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  z-index: 2;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none
    `}
`

export const SavedIcon = ({
  fill = false,
  ...rest
}: { fill: boolean } & HTMLAttributes<HTMLDivElement>): JSX.Element => {
  return (
    <HoverIcon {...rest}>
      <Bookmark style={{ opacity: fill ? 0.8 : 0.4, cursor: 'pointer' }} />
    </HoverIcon>
  )
}
