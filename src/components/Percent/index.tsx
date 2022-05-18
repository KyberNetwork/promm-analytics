import React from 'react'
import { TYPE } from 'theme'
import styled from 'styled-components'
import { Text } from 'rebass'
import { OverflowTooltip } from 'components/Tooltip'

export interface LogoProps {
  value: number | undefined
  decimals?: number
  fontSize?: string
  fontWeight?: number
  wrap?: boolean
  simple?: boolean
}

export default function Percent({
  value,
  decimals = 2,
  fontSize = '14px',
  fontWeight = 500,
  wrap = false,
  simple = false,
  ...rest
}: LogoProps): JSX.Element {
  if (value === undefined || value === null) {
    return (
      <TYPE.main fontWeight={fontWeight} fontSize={fontSize}>
        -
      </TYPE.main>
    )
  }
  const fixedPercent = value.toFixed(decimals)

  if (value === 0 || fixedPercent == '0.00') {
    return <Text fontWeight={500}>0%</Text>
  }

  if (value < 0.0001 && value > 0) {
    return (
      <Text fontWeight={500} color="#31CB9E">
        {'< 0.0001%'}
      </Text>
    )
  }

  if (value < 0 && value > -0.0001) {
    return (
      <Text fontWeight={500} color="#FF537B">
        {'< 0.0001%'}
      </Text>
    )
  }

  if (Number(fixedPercent) > 0) {
    if (Number(fixedPercent) > 100) {
      return (
        <Text fontWeight={500} color="#31CB9E">
          <OverflowTooltip text={`+${value.toFixed(0)}%`}>{`+${value.toFixed(0)}%`}</OverflowTooltip>
        </Text>
      )
    } else {
      return <Text fontWeight={500} color="#31CB9E">{`+${fixedPercent}%`}</Text>
    }
  } else {
    return <Text fontWeight={500} color="#FF537B">{`${fixedPercent}%`}</Text>
  }
}
