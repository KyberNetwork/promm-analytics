import styled from 'styled-components'

export const StyledIcon = styled.div`
  color: ${({ theme }) => theme.subText};
`

export const UnSelectable = styled.span`
  user-select: none;
`

export const EmptyCard = styled.div<{ height: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 20px;
  color: ${({ theme }) => theme.text1};
  height: ${({ height }) => height && height};
`
