import React from 'react'
import { Text } from 'rebass'
import { OverflowTooltip } from 'components/Tooltip'
import styled from 'styled-components'

export interface LogoProps {
  value: number | undefined
  decimals?: number
  fontSize?: number
  fontWeight?: number
}

const PercentText = styled(Text)<{ fontWeight?: number; fontSize?: number; color?: string }>`
  font-weight: ${({ fontWeight }) => fontWeight || 500};
  font-size: ${({ fontSize }) => fontSize || 14};
  color: ${({ color }) => color};
`

export default function Percent({ value, decimals = 2, fontSize, fontWeight }: LogoProps): JSX.Element {
  if (value === undefined || value === null) {
    return (
      <PercentText fontWeight={fontWeight} fontSize={fontSize}>
        -
      </PercentText>
    )
  }
  const fixedPercent = value.toFixed(decimals)

  if (value === 0 || fixedPercent == '0.00') {
    return (
      <PercentText fontWeight={fontWeight} fontSize={fontSize}>
        0%
      </PercentText>
    )
  }

  if (value < 0.0001 && value > 0) {
    return (
      <PercentText fontWeight={fontWeight} fontSize={fontSize} color="#0FAAA2">
        {'< 0.0001%'}
      </PercentText>
    )
  }

  if (value < 0 && value > -0.0001) {
    return (
      <PercentText fontWeight={fontWeight} fontSize={fontSize} color="#FF537B">
        {'-0%'}
      </PercentText>
    )
  }

  if (Number(fixedPercent) > 0) {
    if (Number(fixedPercent) > 100) {
      return (
        <PercentText fontWeight={fontWeight} fontSize={fontSize} color="#31CB9E">
          <OverflowTooltip text={`+${value.toFixed(0)}%`}>{`+${value.toFixed(0)}%`}</OverflowTooltip>
        </PercentText>
      )
    } else {
      return (
        <PercentText fontWeight={fontWeight} fontSize={fontSize} color="#31CB9E">{`+${fixedPercent}%`}</PercentText>
      )
    }
  } else {
    return <PercentText fontWeight={fontWeight} fontSize={fontSize} color="#FF537B">{`${fixedPercent}%`}</PercentText>
  }
}
