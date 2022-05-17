import React, { useCallback, useState } from 'react'
import { Info, HelpCircle } from 'react-feather'
import styled from 'styled-components'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  color: ${({ theme }) => theme.subText};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

export function InfoHelper({ text }: { text: string }): JSX.Element {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <Info size={16} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}

export function QuestionHelper({ text }: { text: string }): JSX.Element {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <HelpCircle size={16} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}
