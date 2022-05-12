import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { TYPE, ExternalLink, MEDIA_WIDTHS, ButtonText } from 'theme'
import { DarkGreyCard, GreyBadge } from 'components/Card'
import Loader, { LoadingRows } from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import { PoolData } from 'state/pools/reducer'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { feeTierPercent, shortenAddress } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import { networkPrefix } from 'utils/networkPrefix'
import { useActiveNetworks } from 'state/application/hooks'
import { Text, Flex } from 'rebass'
import CopyHelper from 'components/Copy'
import { ChevronDown, ChevronUp, Plus } from 'react-feather'
import { useWindowSize } from 'hooks/useWindowSize'
import { QuestionHelper } from 'components/QuestionHelper'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const GridWrapper = styled.div`
  display: grid;
  align-items: center;

  grid-template-columns: 140px 1fr;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 2fr repeat(5, 1fr);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 2fr repeat(3, 1fr);
    & :nth-child(3) {
      display: none;
    }

    & :nth-child(5) {
      display: none;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 2fr repeat(1, 1fr);
      `}
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 18px 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 2fr repeat(1, 1fr);
    & :nth-child(1) {
      display: none;
    }
    & :nth-child(3) {
      display: none;
    }
    & :nth-child(4) {
      display: none;
    }
    & :nth-child(5) {
      display: none;
    }
  `}
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const Add = styled.div`
  border-radius: 999px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.primary + '33'};
`

const OpenPair = styled.div<{ hide: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  margin-left: 4px;
  visibility: ${({ hide }) => (hide ? 'hidden' : 'visibility')};
`

const SORT_FIELD = {
  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
  apr: 'apr',
}

const MAX_ITEMS = 10

export default function PairTable({ pairDatas, maxItems = MAX_ITEMS }: { pairDatas: PoolData[][]; maxItems?: number }) {
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  const size = useWindowSize()

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    let extraPages = 1
    if (pairDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(pairDatas.length / maxItems) + extraPages)
  }, [maxItems, pairDatas])

  const sortedPairs = useMemo(() => {
    return pairDatas
      ? pairDatas
          .sort((a, b) => {
            if (a && b) {
              return a[0][sortField as keyof PoolData] > b[0][sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [maxItems, page, pairDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  const [openPair, setOpenPair] = useState('')
  const [isOpen, setIsOpen] = useState<{ [id: string]: boolean }>({})

  useEffect(() => {
    if (pairDatas[0]?.[0] && !Object.keys(isOpen).length) {
      const id = pairDatas[0][0].token0.address + '_' + pairDatas[0][0].token1.address
      setIsOpen({ [id]: true })
    }
  }, [pairDatas, isOpen])

  const activeNetworks = useActiveNetworks()[0] // TODO namgold: handle all chain view
  if (!pairDatas) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedPairs.length > 0 ? (
        <>
          <GridWrapper>
            <Flex padding="18px 20px" backgroundColor={theme.tableHeader}>
              <ClickableText color={theme.subText}>TOKEN PAIR</ClickableText>
            </Flex>
            <TableHeader>
              <ClickableText color={theme.subText}>Pool | FEE</ClickableText>

              <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                TVL {arrow(SORT_FIELD.tvlUSD)}
              </ClickableText>

              <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.apr)}>
                APR {arrow(SORT_FIELD.apr)}
                <QuestionHelper text="Estimated return based on yearly fees of the pool" />
              </ClickableText>

              <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                Volume 24H {arrow(SORT_FIELD.volumeUSD)}
              </ClickableText>

              <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                Fee 24H {arrow(SORT_FIELD.volumeUSD)}
              </ClickableText>

              <ClickableText color={theme.subText} end={1}>
                Actions
              </ClickableText>
            </TableHeader>
          </GridWrapper>

          <AutoColumn>
            {sortedPairs.map((pair, i) => {
              if (pair) {
                const id = `${pair[0].token0.address}_${pair[0].token1.address}`
                return (
                  <React.Fragment key={i}>
                    {size?.width && size.width <= MEDIA_WIDTHS.upToSmall ? (
                      <>
                        <Flex
                          backgroundColor={theme.background}
                          alignItems="center"
                          justifyContent="space-between"
                          padding="20px"
                          onClick={() => {
                            setIsOpen((prev) => ({
                              ...prev,
                              [id]: !prev[id],
                            }))
                          }}
                        >
                          <RowFixed>
                            <DoubleCurrencyLogo
                              address0={pair[0].token0.address}
                              address1={pair[0].token1.address}
                              activeNetwork={activeNetworks}
                            />
                            <Label marginLeft="8px">
                              {pair[0].token0.symbol} - {pair[0].token1.symbol}
                            </Label>
                          </RowFixed>

                          <ButtonText>
                            {isOpen[id] ? <ChevronUp color={theme.text} /> : <ChevronDown color={theme.text} />}
                          </ButtonText>
                        </Flex>
                        {isOpen[id] &&
                          pair.map((poolData, i) => (
                            <React.Fragment key={poolData.address}>
                              <LinkWrapper to={networkPrefix(activeNetworks) + 'pool/' + poolData.address}>
                                <GridWrapper
                                  role="button"
                                  style={{ padding: '16px 20px', background: theme.tableHeader }}
                                >
                                  <Label fontWeight={400}>
                                    <AutoColumn gap="8px">
                                      <RowFixed>
                                        <Label>{shortenAddress(poolData.address)}</Label>
                                        <CopyHelper toCopy={poolData.address} />
                                      </RowFixed>
                                      <Text fontSize="12px" color={theme.subText}>
                                        Fee = {feeTierPercent(poolData.feeTier)}
                                      </Text>
                                    </AutoColumn>
                                  </Label>

                                  <ResponsiveGrid>
                                    <Label end={1} fontWeight={400}>
                                      {formatDollarAmount(poolData.tvlUSD)}
                                    </Label>
                                    <ExternalLink
                                      href={`https://kyberswap.com/#/proamm/add/${poolData.token0.address}/${poolData.token1.address}/${poolData.feeTier}`}
                                      style={{
                                        justifyContent: 'flex-end',
                                      }}
                                    >
                                      <Add>
                                        <Plus color={theme.primary} size="16px" />
                                      </Add>
                                    </ExternalLink>
                                  </ResponsiveGrid>
                                </GridWrapper>
                              </LinkWrapper>
                              {i !== pair.length - 1 && <Break />}
                            </React.Fragment>
                          ))}
                      </>
                    ) : (
                      <GridWrapper
                        style={{
                          padding: '16px 20px',
                          backgroundColor: openPair === id ? theme.tableHeader : theme.background,
                        }}
                      >
                        <div>
                          <DoubleCurrencyLogo
                            address0={pair[0].token0.address}
                            address1={pair[0].token1.address}
                            activeNetwork={activeNetworks}
                          />
                          <Label marginTop="8px">
                            {pair[0].token0.symbol} - {pair[0].token1.symbol}
                          </Label>
                        </div>
                        <AutoColumn gap="16px">
                          {pair.map((poolData, index) => {
                            if (index === 0 || openPair === id)
                              return (
                                <React.Fragment key={poolData.address}>
                                  <ResponsiveGrid
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      if (pair.length === 1) {
                                        return
                                      }

                                      setOpenPair((prev) => (prev === id ? '' : id))
                                    }}
                                  >
                                    <Label fontWeight={400}>
                                      <AutoColumn gap="8px">
                                        <RowFixed>
                                          <LinkWrapper to={networkPrefix(activeNetworks) + 'pool/' + poolData.address}>
                                            <Label color={theme.primary}>{shortenAddress(poolData.address)}</Label>
                                          </LinkWrapper>
                                          <CopyHelper toCopy={poolData.address} />
                                        </RowFixed>
                                        <Text fontSize="12px" color={theme.subText}>
                                          Fee = {feeTierPercent(poolData.feeTier)}
                                        </Text>
                                      </AutoColumn>
                                    </Label>
                                    <Label end={1} fontWeight={400}>
                                      {formatDollarAmount(poolData.tvlUSD)}
                                    </Label>
                                    <Label>{/* TODO: apr */}</Label>
                                    <Label end={1} fontWeight={400}>
                                      {formatDollarAmount(poolData.volumeUSD)}
                                    </Label>
                                    <Label end={1} fontWeight={400}>
                                      {formatDollarAmount(poolData.volumeUSD * (poolData.feeTier / 1000000))}
                                    </Label>

                                    <Flex justifyContent="flex-end">
                                      <ExternalLink
                                        href={`https://kyberswap.com/#/proamm/add/${poolData.token0.address}/${poolData.token1.address}/${poolData.feeTier}`}
                                      >
                                        <Add>
                                          <Plus color={theme.primary} size="16px" />
                                        </Add>
                                      </ExternalLink>
                                      <OpenPair
                                        hide={index !== 0}
                                        role="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (pair.length === 1) {
                                            return
                                          }

                                          setOpenPair((prev) => (prev === id ? '' : id))
                                        }}
                                      >
                                        {openPair === `${pair[0].token0.address}_${pair[0].token1.address}` ? (
                                          <ChevronUp color={theme.text} />
                                        ) : (
                                          <ChevronDown color={pair.length === 1 ? theme.disabledText : theme.text} />
                                        )}
                                      </OpenPair>
                                    </Flex>
                                  </ResponsiveGrid>
                                  {index !== pair.length - 1 && openPair === id && <Break />}
                                </React.Fragment>
                              )
                            else return null
                          })}
                        </AutoColumn>
                      </GridWrapper>
                    )}

                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
            <PageButtons style={{ padding: '16px' }}>
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
        </>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}
