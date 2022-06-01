import styled from 'styled-components'
import { TYPE } from 'theme'

// responsive text
export const Label = styled(TYPE.label)<{ end?: number; fontSize?: number }>`
  display: flex;
  font-size: ${({ fontSize }) => fontSize || 14}px;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
  font-variant-numeric: tabular-nums;
  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`

export const TableTitle = styled(TYPE.title)<{ end?: boolean }>`
  user-select: none;
  text-transform: uppercase;

  ${({ end }) =>
    end &&
    `display: flex;
    justify-content: flex-end;`}
`

export const ClickableText = styled(TableTitle)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`
