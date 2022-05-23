import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Link as RouterLink } from 'react-router-dom'
import { Search as SearchIcon, X } from 'react-feather'

import Row, { RowFixed } from 'components/Row'
import { useActiveNetworks } from 'state/application/hooks'
import CurrencyLogo from 'components/CurrencyLogo'
import { TYPE } from 'theme'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { useFetchSearchResults } from 'data/search'
import FormattedName from 'components/FormattedName'

const BasicLink = styled(RouterLink)`
  text-decoration: none;
  color: inherit;
  &:hover {
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
`

const Container = styled.div`
  height: 48px;
  z-index: 30;
  position: relative;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

const Wrapper = styled.div<{ open: boolean }>`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '8px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '8px')};
  z-index: 9999;
  width: 100%;
  min-width: 300px;
  box-sizing: border-box;
`
const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  margin-right: 0.5rem;
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: ${({ theme }) => theme.text3};
`

const CloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text3};
  :hover {
    cursor: pointer;
  }
`

const Menu = styled.div<{ hide: boolean }>`
  display: flex;
  flex-direction: column;
  z-index: 9999;
  width: 100%;
  top: 50px;
  max-height: 540px;
  overflow: auto;
  left: 0;
  padding-bottom: 20px;
  background: ${({ theme }) => theme.background};
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);
  display: ${({ hide }) => hide && 'none'};
`

const MenuItem = styled(Row)`
  padding: 1rem;
  font-size: 0.85rem;
  & > * {
    margin-right: 6px;
  }
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const Heading = styled(Row)<{ hide?: boolean }>`
  padding: 1rem;
  display: ${({ hide = false }) => hide && 'none'};
`

const Gray = styled.span`
  color: #888d9b;
`

const Blue = styled.span`
  color: ${({ theme }) => theme.primary};
  :hover {
    cursor: pointer;
  }
`

export const Search = (): JSX.Element => {
  const activeNetwork = useActiveNetworks()[0]
  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const { tokens, pools } = useFetchSearchResults(value)

  const [tokensShown, setTokensShown] = useState(3)
  const [pairsShown, setPairsShown] = useState(3)

  useEffect(() => {
    if (value !== '') {
      toggleMenu(true)
    } else {
      toggleMenu(false)
    }
  }, [value])

  const onDismiss = useCallback(() => {
    setPairsShown(3)
    setTokensShown(3)
    toggleMenu(false)
    setValue('')
  }, [])

  // refs to detect clicks outside modal
  const wrapperRef = useRef<HTMLInputElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const handleClick = useCallback((e) => {
    if (!menuRef.current?.contains(e.target) && !wrapperRef.current?.contains(e.target)) {
      setPairsShown(3)
      setTokensShown(3)
      toggleMenu(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [handleClick])

  return (
    <Container>
      <Wrapper open={showMenu}>
        <Input
          // large={!small}
          type={'text'}
          ref={wrapperRef}
          placeholder={'Search tokens and pools...'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            if (!showMenu) {
              toggleMenu(true)
            }
          }}
        />
        {!showMenu ? (
          <SearchIconLarge />
        ) : (
          <CloseIcon
            onClick={() => {
              setValue('')
              toggleMenu(false)
            }}
          />
        )}
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <Heading>
          <Gray>Pairs</Gray>
        </Heading>
        <div>
          {!pools ||
            (pools.length === 0 && (
              <MenuItem>
                <TYPE.body>No results</TYPE.body>
              </MenuItem>
            ))}
          {pools?.slice(0, pairsShown).map((pool) => {
            return (
              <BasicLink
                // to={'/' + NETWORKS_INFO[pool.chainId].urlKey + '/pool/' + pool.id}
                to={'/' + activeNetwork.route + '/pool/' + pool.address}
                key={pool.address}
                onClick={onDismiss}
              >
                <MenuItem>
                  <DoubleCurrencyLogo
                    address0={pool?.token0?.address}
                    address1={pool?.token1?.address}
                    margin={true}
                    // activeNetwork={NETWORKS_INFO[pool.chainId]}
                    activeNetwork={activeNetwork}
                  />
                  <TYPE.body style={{ marginLeft: '10px' }}>
                    {pool.token0.symbol + '-' + pool.token1.symbol} Pair
                  </TYPE.body>
                </MenuItem>
              </BasicLink>
            )
          })}
          <Heading hide={!(pools.length > 3 && pools.length >= pairsShown)}>
            <Blue
              onClick={() => {
                setPairsShown(pairsShown + 5)
              }}
            >
              See more...
            </Blue>
          </Heading>
        </div>
        <Heading>
          <Gray>Tokens</Gray>
        </Heading>
        <div>
          {tokens.length === 0 && (
            <MenuItem>
              <TYPE.body>No results</TYPE.body>
            </MenuItem>
          )}
          {tokens.slice(0, tokensShown).map((token) => {
            return (
              <BasicLink
                // to={'/' + NETWORKS_INFO[token.chainId].urlKey + '/token/' + token.id} //todo namgold: support all chain view
                to={'/' + activeNetwork.route + '/token/' + token.address}
                key={token.address}
                onClick={onDismiss}
              >
                <MenuItem>
                  <RowFixed>
                    <CurrencyLogo
                      address={token.address}
                      style={{ marginRight: '10px' }}
                      // networkInfo={NETWORKS_INFO[token.chainId]} //todo namgold: support all chain view
                      activeNetwork={activeNetwork}
                    />
                    <FormattedName text={token.name} maxCharacters={20} style={{ marginRight: '6px' }} />
                    (<FormattedName text={token.symbol} maxCharacters={6} />)
                  </RowFixed>
                </MenuItem>
              </BasicLink>
            )
          })}

          <Heading hide={!(tokens.length > 3 && tokens.length >= tokensShown)}>
            <Blue
              onClick={() => {
                setTokensShown(tokensShown + 5)
              }}
            >
              See more...
            </Blue>
          </Heading>
        </div>
      </Menu>
    </Container>
  )
}

export default Search
