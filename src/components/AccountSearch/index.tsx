import React, { useCallback, useState } from 'react'
// import 'feather-icons'
import { useHistory, Link as RouterLink } from 'react-router-dom'
import styled from 'styled-components'
import { Flex, Text, Box } from 'rebass'
import { X } from 'react-feather'

import { ButtonDark } from 'components/Button'
import { isAddress } from '../../utils'
import { AutoColumn, AutoColumnFullWidth } from 'components/Column'
import Panel from 'components/Panel'
import { RowFixed } from 'components/Row'
import { useActiveNetworks } from 'state/application/hooks'
import { TYPE } from 'theme'
import { useSavedAccounts } from 'state/user/hooks'

const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: inherit;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`

const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => `${theme.border}99`};
`

const Hover = styled.div<{ fade?: boolean }>`
  :hover {
    cursor: pointer;
    opacity: ${({ fade }) => fade && '0.7'};
  }
`

const StyledIcon = styled.div`
  color: ${({ theme }) => theme.subText};
`

const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  padding: 12px 16px;
  border-radius: 8px;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.background};
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.border};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 12px;
  }
`
const Wrapper = styled.div<{ isWrap?: boolean }>`
  ${({ isWrap, theme }) =>
    isWrap
      ? `
  justify-content: space-between;
  background-color: ${theme.bg4};
  border-radius: 24px;
  padding: 8px;
  `
      : ''}
  color: ${({ theme }) => theme.subText};
`

const AccountLink = styled.span<{ isSmall?: boolean }>`
  cursor: pointer;
  ${({ isSmall, theme }) => !isSmall && `color: ${theme.primary};`}
  font-size: 14px;
  font-weight: 500;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr;
  grid-template-areas: 'account';
  padding: 0 4px;

  > * {
    justify-content: flex-end;
  }
`

const InputWrapper = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: auto 72px;

  > * {
    justify-content: flex-end;
  }
`

type AccountSearchPropsType = {
  small?: boolean
  shortenAddress: boolean
}
function AccountSearch({ small, shortenAddress }: AccountSearchPropsType): JSX.Element {
  const history = useHistory()
  const [accountValue, setAccountValue] = useState<string>('')
  const [savedAccounts, updateSavedAccounts] = useSavedAccounts()
  const [activeNetwork] = useActiveNetworks()

  const handleAccountSearch = useCallback(() => {
    if (isAddress(accountValue.trim())) {
      history.push('/' + activeNetwork.route + '/account/' + accountValue.trim())
      updateSavedAccounts(activeNetwork.chainId, accountValue.trim())
    }
  }, [accountValue, activeNetwork.chainId, activeNetwork.route, updateSavedAccounts, history])

  return (
    <AutoColumnFullWidth gap={'1rem'}>
      {!small && (
        <InputWrapper>
          <Input
            placeholder="Search Wallet/Account..."
            onChange={(e) => {
              setAccountValue(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAccountSearch()
              }
            }}
          />
          <ButtonDark onClick={handleAccountSearch} style={{ height: '44px' }} padding="8px 12px">
            <Text>Analyze</Text>
          </ButtonDark>
        </InputWrapper>
      )}

      <AutoColumn gap={'12px'}>
        <Panel
          style={{
            ...(small && {
              padding: 0,
              border: 'none',
            }),
          }}
        >
          <DashGrid style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
            <TYPE.main>Saved Accounts</TYPE.main>
          </DashGrid>
          {!small && <Divider />}
          {Object.keys(savedAccounts[activeNetwork.chainId] ?? {}).length > 0 ? (
            Object.keys(savedAccounts[activeNetwork.chainId] ?? {}).map((account) => {
              return (
                <DashGrid key={account} style={{ height: 'fit-content', padding: '1rem 0 0 0' }}>
                  <Flex justifyContent="space-between">
                    <Wrapper isWrap={small}>
                      <BasicLink to={'/' + activeNetwork.route + '/account/' + account}>
                        <RowFixed>
                          {small && <img src={activeNetwork.imageURL} width="16px" style={{ marginRight: '4px' }} />}
                          <AccountLink isSmall={small}>
                            {shortenAddress || small
                              ? `${account?.slice(0, 6) + '...' + account?.slice(38, 42)}`
                              : account?.slice(0, 42)}
                          </AccountLink>
                        </RowFixed>
                      </BasicLink>
                    </Wrapper>

                    <Hover
                      onClick={(e) => {
                        e.stopPropagation()
                        updateSavedAccounts(activeNetwork.chainId, account)
                      }}
                    >
                      <StyledIcon>
                        <X size={16} />
                      </StyledIcon>
                    </Hover>
                  </Flex>
                </DashGrid>
              )
            })
          ) : (
            <TYPE.light style={{ marginTop: '1rem' }}>No saved accounts</TYPE.light>
          )}
        </Panel>
      </AutoColumn>
    </AutoColumnFullWidth>
  )
}

export default AccountSearch
