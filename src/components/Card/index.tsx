import styled from 'styled-components'
import { Box } from 'rebass/styled-components'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  border-radius: 8px;
  padding: 1rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`
export default Card

export const LightCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

export const LightGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg3};
`

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.background};
`

export const DarkGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
`

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.bg3};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow3};
  font-weight: 500;
`

export const BlueCard = styled(Card)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.blue2};
  border-radius: 12px;
  width: fit-content;
`

export const ScrollableX = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  ::-webkit-scrollbar {
    display: none;
  }
`

export const GreyBadge = styled(Card)`
  width: fit-content;
  border-radius: 999px;
  background: ${({ theme }) => theme.primary + '33'};
  color: ${({ theme }) => theme.primary};
  padding: 2px 6px;
  font-weight: 400;
  font-size: 12px;
`
