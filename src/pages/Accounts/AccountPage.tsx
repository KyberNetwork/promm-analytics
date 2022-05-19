import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { Button as RebassButton } from 'rebass/styled-components'
import { Activity } from 'react-feather'
import { useMedia } from 'react-use'

import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary, SavedIcon } from 'components/Button'
import { DarkGreyCard } from 'components/Card'
import TransactionTable from 'components/TransactionsTable'
import { Arrow, Break, PageButtons } from 'components/shared'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import Loading from 'components/Loader/Loading'
import { PositionFields, useFetchedUserPositionData, useUserTransactions } from 'data/wallets/walletData'
import { Label } from 'components/Text'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { useEthPrices } from 'hooks/useEthPrices'
import { Box, BoxProps } from 'rebass/styled-components'
import { calcPosition } from 'utils/position'
// import PoolChart from './components/PoolChart'
// import AllPoolChart from './components/AllPoolChart'
import Panel from 'components/Panel'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { ButtonDropdown } from 'components/Button'
import PoolChart from './components/PoolChart'
import AllPoolChart from './components/AllPoolChart'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import Search from 'components/Search'
import { useSavedAccounts } from 'state/user/hooks'

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

export const StyledIcon = styled.div`
  color: ${({ theme }) => theme.subText};
`

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  border-bottom-right-radius: ${({ open }) => open && '0'};
  border-bottom-left-radius: ${({ open }) => open && '0'};
`

export const ButtonFaded = styled(Base)`
  background-color: ${({ theme }) => theme.bg2};
  color: (255, 255, 255, 0.5);
  white-space: nowrap;

  :hover {
    opacity: 0.5;
  }
`

const DropdownWrapper = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
`

const Flyout = styled.div`
  position: absolute;
  top: 38px;
  left: -1px;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  z-index: 999;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  padding-top: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  border-top: none;
`

type RowProp = {
  align?: string
  padding?: string
  border?: string
  borderRadius?: string
  justify?: string
  onClick?: () => void
}

const Row = styled(Box)<RowProp & React.FunctionComponent<BoxProps>>`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  align-items: ${({ align }) => align && align};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  justify-content: ${({ justify }) => justify};
`

const MenuRow = styled(Row)`
  width: 100%;
  padding: 12px 0;
  padding-left: 12px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.buttonBlack};
  }
`

const PanelWrapper = styled.div`
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
`

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 2.5fr 2fr 2fr 2fr 2fr;
  grid-template-areas: 'pair pool liquidity tokenAmount tokenAmount2 ';
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 18px 20px;
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const TableLabel = styled(Label)`
  color: ${({ theme }) => theme.subText};
  font-weight: 500;
  font-size: 12px;
`

type FormattedPosition = {
  tokenId: string
  address: string
  valueUSD: number
  token0Amount: number
  token1Amount: number
}

export default function AccountPage(): JSX.Element {
  let { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]
  const [showDropdown, setShowDropdown] = useState(false)
  const [activePosition, setActivePosition] = useState<PositionFields | null>(null)
  const node = useRef<HTMLDivElement>(null)

  address = address.toLowerCase()
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const transactions = useUserTransactions(address)

  const { data } = useFetchedUserPositionData(address)
  const ethPriceUSD = useEthPrices()

  const positionsMap: { [key: string]: FormattedPosition } = useMemo(() => {
    const positionMap: { [key: string]: FormattedPosition } = {}

    data?.forEach((p) => {
      const position = calcPosition({ p, chainId: activeNetwork.chainId, ethPriceUSD: ethPriceUSD?.current })

      positionMap[p.id] = {
        tokenId: p.id,
        address: p.pool.id,
        valueUSD: position.userPositionUSD,
        token0Amount: position.token0Amount,
        token1Amount: position.token1Amount,
      }
    })
    return positionMap
  }, [data, activeNetwork.chainId, ethPriceUSD])

  const currentPosition = useMemo(() => (activePosition ? [activePosition] : data), [activePosition, data])

  const positionValue = useMemo(() => {
    return currentPosition ? currentPosition.reduce((total, p) => total + positionsMap[p.id].valueUSD, 0) : null
  }, [currentPosition, positionsMap])

  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const maxItems = 10
  useEffect(() => {
    let extraPages = 1
    if (data) {
      if (data.length % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(data.length / maxItems) + extraPages)
    }
  }, [maxItems, data])
  useOnClickOutside(node, showDropdown ? () => setShowDropdown(!showDropdown) : undefined)
  const below600 = useMedia('(max-width: 600px)')
  const [savedAccounts, addSavedAccount] = useSavedAccounts()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {data ? (
        <AutoColumn gap="24px">
          <RowBetween>
            <AutoRow gap="4px">
              <StyledInternalLink to={networkPrefix(activeNetwork)}>
                <TYPE.main>{`Home → `}</TYPE.main>
              </StyledInternalLink>
              <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                <TYPE.label>{` Accounts `}</TYPE.label>
              </StyledInternalLink>
              <TYPE.main>{` → `}</TYPE.main>
              <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                <TYPE.link>{shortenAddress(address)}</TYPE.link>
              </StyledExternalLink>
            </AutoRow>
            {!below600 && <Search />}
          </RowBetween>
          <ResponsiveRow align="flex-end">
            <Label fontSize={24}>{shortenAddress(address)}</Label>
            <RowFixed>
              <SavedIcon
                fill={!!savedAccounts?.[activeNetwork.chainId]?.[address]}
                onClick={() => addSavedAccount(activeNetwork.chainId, data[0].owner)}
              />
              <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                <ButtonPrimary width="fit-content" style={{ height: '38px' }}>
                  View on {activeNetwork.etherscanName}↗
                </ButtonPrimary>
              </StyledExternalLink>
            </RowFixed>
          </ResponsiveRow>
          <AutoColumn gap="3rem">
            <AutoColumn gap="1rem">
              <DropdownWrapper ref={node}>
                <ButtonDropdown
                  width="100%"
                  onClick={() => setShowDropdown(!showDropdown)}
                  open={showDropdown}
                  style={{ borderRadius: '8px', background: theme.background }}
                >
                  {!activePosition && (
                    <RowFixed>
                      <StyledIcon>
                        <Activity size={16} />
                      </StyledIcon>
                      <TYPE.body ml="10px">All Positions</TYPE.body>
                    </RowFixed>
                  )}
                  {activePosition && (
                    <RowFixed>
                      <DoubleCurrencyLogo
                        address0={activePosition.token0.id}
                        address1={activePosition.token1.id}
                        size={16}
                        activeNetwork={activeNetwork}
                      />
                      <TYPE.body ml="16px">
                        {activePosition.token0.symbol}-{activePosition.token1.symbol} Position
                      </TYPE.body>
                    </RowFixed>
                  )}
                </ButtonDropdown>
                {showDropdown && (
                  <Flyout>
                    <AutoColumn gap="0px">
                      {data?.map((p, i) => {
                        if (p.token1.symbol === 'WETH') {
                          p.token1.symbol = 'ETH'
                        }
                        if (p.token0.symbol === 'WETH') {
                          p.token0.symbol = 'ETH'
                        }
                        return (
                          p.id !== activePosition?.id && (
                            <MenuRow
                              onClick={() => {
                                setActivePosition(p)
                                setShowDropdown(false)
                              }}
                              key={i}
                              name="asd"
                            >
                              <DoubleCurrencyLogo
                                address0={p.token0.id}
                                address1={p.token1.id}
                                size={16}
                                activeNetwork={activeNetwork}
                              />
                              <TYPE.body ml="16px">
                                {p.token0.symbol}-{p.token1.symbol} Position
                              </TYPE.body>
                            </MenuRow>
                          )
                        )
                      })}
                      {activePosition && (
                        <MenuRow
                          onClick={() => {
                            setActivePosition(null)
                            setShowDropdown(false)
                          }}
                          name="dsad"
                        >
                          <RowFixed>
                            <StyledIcon>
                              <Activity size={16} />
                            </StyledIcon>
                            <TYPE.body ml="10px">All Positions</TYPE.body>
                          </RowFixed>
                        </MenuRow>
                      )}
                    </AutoColumn>
                  </Flyout>
                )}
              </DropdownWrapper>
              <Panel style={{ height: '100%', marginBottom: '1rem' }}>
                <AutoRow gap="20px">
                  <AutoColumn gap="12px">
                    <RowBetween>
                      <TYPE.body color={theme.subText}> TVL</TYPE.body>
                      <div />
                    </RowBetween>
                    <RowFixed align="flex-end">
                      <TYPE.header fontSize="24px" lineHeight={1}>
                        {positionValue
                          ? formatDollarAmount(positionValue)
                          : positionValue === 0
                          ? formatDollarAmount(0)
                          : '-'}
                      </TYPE.header>
                    </RowFixed>
                  </AutoColumn>
                </AutoRow>
              </Panel>
              <PanelWrapper>
                <Panel style={{ gridColumn: '1' }}>
                  {activePosition ? (
                    <PoolChart account={address} activePosition={activePosition} />
                  ) : (
                    <AllPoolChart account={address} />
                  )}
                </Panel>
              </PanelWrapper>
            </AutoColumn>

            <AutoColumn gap="1.5rem">
              <TYPE.label fontSize="18px">Positions</TYPE.label>
              <Wrapper>
                <TableHeader>
                  <TableLabel>PAIR</TableLabel>
                  <TableLabel end={1}>POOL</TableLabel>
                  <TableLabel end={1}>VALUE</TableLabel>
                  <TableLabel end={1}>TOKEN AMOUNT</TableLabel>
                  <TableLabel end={1}>TOKEN AMOUNT</TableLabel>
                </TableHeader>
                <AutoColumn gap="16px" style={{ padding: '20px' }}>
                  {data ? (
                    data.slice(maxItems * (page - 1), page * maxItems).map((item) => (
                      <React.Fragment key={item.id}>
                        <ResponsiveGrid>
                          <Label>
                            <RowFixed>
                              <DoubleCurrencyLogo
                                address0={item.token0.id}
                                address1={item.token1.id}
                                size={16}
                                activeNetwork={activeNetwork}
                              />
                              <Label marginLeft="4px">
                                {item.token0.symbol} - {item.token1.symbol}
                              </Label>
                            </RowFixed>
                          </Label>
                          <LinkWrapper to={networkPrefix(activeNetwork) + 'pool/' + item.pool.id}>
                            <Label end={1} color={theme.primary}>
                              {shortenAddress(item.pool.id)}
                            </Label>
                          </LinkWrapper>
                          <Label end={1}>{formatDollarAmount(positionsMap[item.id].valueUSD)}</Label>
                          <Label end={1}>{formatAmount(positionsMap[item.id].token0Amount)}</Label>
                          <Label end={1}>{formatAmount(positionsMap[item.id].token1Amount)}</Label>
                        </ResponsiveGrid>
                        <Break />
                      </React.Fragment>
                    ))
                  ) : (
                    <Flex justifyContent="center">
                      <Loading />
                    </Flex>
                  )}
                  <PageButtons>
                    <div
                      onClick={() => {
                        setPage(page === 1 ? page : page - 1)
                      }}
                    >
                      <Arrow faded={page === 1 ? true : false}>←</Arrow>
                    </div>
                    <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
                    <div
                      onClick={() => {
                        setPage(page === maxPage ? page : page + 1)
                      }}
                    >
                      <Arrow faded={page === maxPage ? true : false}>→</Arrow>
                    </div>
                  </PageButtons>
                </AutoColumn>
              </Wrapper>
            </AutoColumn>

            <AutoColumn gap="1.5rem">
              <TYPE.label fontSize="18px">Transactions</TYPE.label>
              <TransactionTable transactions={transactions.data} />
            </AutoColumn>
          </AutoColumn>
        </AutoColumn>
      ) : (
        <Flex justifyContent="center">
          <Loading />
        </Flex>
      )}
    </PageWrapper>
  )
}
