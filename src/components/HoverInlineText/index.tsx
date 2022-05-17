import Tooltip from 'components/Tooltip'
import React, { useState } from 'react'
import styled from 'styled-components'

const TextWrapper = styled.div<{
  margin: boolean
  link: boolean
  fontSize?: string
  adjustSize?: boolean
  color?: string
}>`
  position: relative;
  margin-left: ${({ margin }) => margin && '4px'};
  font-size: ${({ fontSize }) => fontSize ?? 'inherit'};
  color: ${({ color, theme }) => color || theme.text};

  :hover {
    cursor: pointer;
  }

  @media screen and (max-width: 600px) {
    font-size: ${({ adjustSize }) => adjustSize && '12px'};
  }
`

const HoverInlineText = ({
  text,
  maxCharacters = 20,
  margin = false,
  adjustSize = false,
  fontSize,
  link,
  color,
  ...rest
}: {
  text: string
  maxCharacters?: number
  margin?: boolean
  adjustSize?: boolean
  fontSize?: string
  color?: string
  link?: boolean
}): JSX.Element => {
  const [showHover, setShowHover] = useState(false)

  if (!text) {
    return <span></span>
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={!!link}
          color={color}
          fontSize={fontSize}
          {...rest}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    )
  }

  return (
    <TextWrapper margin={margin} adjustSize={adjustSize} link={!!link} color={color} fontSize={fontSize} {...rest}>
      {text}
    </TextWrapper>
  )
}

export default HoverInlineText
