import React, { useState } from 'react'
import { HelpCircle } from 'react-feather'
import { ImageProps } from 'rebass'
import styled from 'styled-components'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps extends Pick<ImageProps, 'style' | 'alt' | 'className'> {
  srcs: string[]
}

const WhiteHelpCircle = styled(HelpCircle)`
  background-color: ${({ theme }) => theme.white};
  border-radius: 50% !important;
`

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ srcs, alt, ...rest }: LogoProps): JSX.Element {
  const [refreshTimes, setRefresh] = useState<number>(0)

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src])

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          if (src) BAD_SRCS[src] = true
          setTimeout(() => setRefresh((i) => i + 1), refreshTimes * 100)
        }}
        onLoad={() => {
          setRefresh(0)
        }}
      />
    )
  }

  return <WhiteHelpCircle {...rest} />
}
