import React, { useState } from 'react'
import styled from 'styled-components'
import Tooltip from '../Tooltip'
import { darken } from 'polished'

type TextWrapperTypeProps = {
  margin?: boolean
  adjustSize?: boolean
  fontSize?: string
  link?: boolean
}

const TextWrapper = styled.div<TextWrapperTypeProps>`
  position: relative;
  margin-left: ${({ margin }) => margin && '4px'};
  color: ${({ theme, link }) => (link ? theme.primary : theme.text1)};
  font-size: ${({ fontSize }) => fontSize ?? 'inherit'};

  :hover {
    cursor: pointer;
    color: ${({ theme, link }) => (link ? darken(0.05, theme.primary) : theme.text1)};
  }

  @media screen and (max-width: 600px) {
    font-size: ${({ adjustSize }) => adjustSize && '12px'};
  }
`

type FormattedNameTypeProps = {
  text: string
  maxCharacters: number
  margin?: boolean
  adjustSize?: boolean
  fontSize?: string
  link?: boolean
  style?: any
  rest?: any
}

const FormattedName = ({
  text,
  maxCharacters,
  margin = false,
  adjustSize = false,
  fontSize,
  link,
  style,
  ...rest
}: FormattedNameTypeProps): React.ReactElement<FormattedNameTypeProps> => {
  const [showHover, setShowHover] = useState(false)

  if (!text) {
    return <></>
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={link}
          fontSize={fontSize}
          style={style}
          {...rest}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    )
  }

  return (
    <TextWrapper margin={margin} adjustSize={adjustSize} link={link} fontSize={fontSize} style={style} {...rest}>
      {text}
    </TextWrapper>
  )
}

export default FormattedName
