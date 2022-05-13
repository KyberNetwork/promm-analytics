import React from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div<{ fontSize?: number }>`
  width: 228px;
  padding: 0.6rem 1rem;
  line-height: 150%;
  font-weight: 400;
  font-size: ${({ fontSize }) => fontSize || 14}px;
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: string
  fontSize?: number
}

export default function Tooltip({ text, fontSize, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer fontSize={fontSize}>{text}</TooltipContainer>} {...rest} />
}
