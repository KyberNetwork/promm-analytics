import React from 'react'
import styled from 'styled-components'

export const StyledIcon = styled.div`
  color: ${({ theme }) => theme.subText};
`

export const UnSelectable = styled.span`
  user-select: none;
`
