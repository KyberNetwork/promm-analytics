import React, { useCallback, useEffect, useRef, useState } from 'react'
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

export default function Tooltip({ text, fontSize, ...rest }: TooltipProps): JSX.Element {
  return <Popover content={<TooltipContainer fontSize={fontSize}>{text}</TooltipContainer>} {...rest} />
}

export function OverflowTooltip({ children, text }: { children: any; text: string }): JSX.Element {
  const [hoverStatus, setHover] = useState(false)
  const textElementRef = useRef<HTMLDivElement | null>(null)

  const compareSize = useCallback(() => {
    if (textElementRef.current && textElementRef.current) {
      setHover(textElementRef.current.scrollWidth > textElementRef.current.clientWidth)
    }
  }, [])

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
    return () => {
      window.removeEventListener('resize', compareSize)
    }
  }, [compareSize])

  const [show, setShow] = useState(false)
  const open = useCallback(() => hoverStatus && setShow(true), [setShow, hoverStatus])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip
      text={text}
      show={show}
      // width="100%"
    >
      <div
        onMouseEnter={open}
        onMouseLeave={close}
        ref={textElementRef}
        style={{
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </div>
    </Tooltip>
  )
}
