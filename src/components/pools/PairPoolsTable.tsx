import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { ExternalLink, MEDIA_WIDTHS, ButtonText } from 'theme'
import { DarkGreyCard } from 'components/Card'
import Loader, { LoadingRows } from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import { PoolData } from 'state/pools/reducer'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { feeTierPercent, getPoolLink, shortenAddress } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import { networkPrefix } from 'utils/networkPrefix'
import { useActiveNetworkUtils } from 'state/application/hooks'
import { Text, Flex } from 'rebass'
import CopyHelper from 'components/Copy'
import Pagination from 'components/Pagination'
import { ChevronDown, ChevronUp, Plus } from 'react-feather'
import { useWindowSize } from 'hooks/useWindowSize'
import { QuestionHelper } from 'components/QuestionHelper'
import { NETWORKS_INFO_MAP } from 'constants/networks'

const BreakWrapper = styled(Break)`
  margin-top: 1px;
  margin-bottom: 1px;
`

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const GridWrapper = styled.div<{ isAllChain: boolean }>`
  display: grid;
  align-items: center;
  grid-template-columns: ${({ isAllChain }) => `${isAllChain ? 2 : 1}fr 6fr`};
  ${({ theme, isAllChain }) => theme.mediaWidth.upToMedium`
    grid-template-columns: ${`${isAllChain ? 2 : 1}`}fr 4fr;
  `};
  ${({ theme, isAllChain }) => theme.mediaWidth.upToSmall`
    grid-template-columns: ${`${isAllChain ? '1fr 2fr' : '1fr 4fr'}`};
  `}
`

// right column
const ResponsiveGrid = styled.div<{ isAllChain: boolean }>`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: repeat(6, 1fr);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(4, 1fr);
    & .avg {
      display: none;
    }
    & .fee {
      display: none;
    }
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(2, 1fr);
  `}
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 20px;
  height: 100%;

  ${({ theme, isAllChain }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(${isAllChain ? 2 : 2}, 1fr);
    & :nth-child(1) {
      display: none;
    }
    & .volume {
      display: none;
    }
  `}
`

const TableHeaderLeft = styled.div<{ isAllChain: boolean }>`
  display: grid;
  grid-gap: 1em;
  padding: 20px;
  grid-template-columns: ${({ isAllChain }) => `${isAllChain ? '1fr 1fr' : '1fr'}`};
  background: ${({ theme }) => theme.tableHeader};
  height: 100%;
  & .network {
    text-align: center;
  }
`

const ColumnLeft = styled(TableHeaderLeft)`
  background: transparent;
  padding: 0px;
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

enum SORT_FIELD {
  fee = 'fee',
  volumeUSD = 'volumeUSD',
  tvlUSD = 'tvlUSD',
  volumeUSDWeek = 'volumeUSDWeek',
  apr = 'apr',
  chainId = 'chainId',
}

const MAX_ITEMS = 10

export default function PairPoolsTable({
  pairDatas,
  maxItems = MAX_ITEMS,
}: {
  pairDatas: PoolData[][]
  maxItems?: number
}): JSX.Element {
  // theming
  const theme = useTheme()
  const { isAllChain, chainId } = useActiveNetworkUtils()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  const size = useWindowSize()

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [chainId])

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
    (newField: SORT_FIELD) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
      setPage(1)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: SORT_FIELD) => {
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

  if (!pairDatas) {
    return <Loader />
  }

  const isMobile = size?.width && size.width <= MEDIA_WIDTHS.upToSmall

  return (
    <Wrapper>
      {sortedPairs.length > 0 ? (
        <>
          <GridWrapper isAllChain={isAllChain}>
            <TableHeaderLeft isAllChain={isAllChain}>
              <ClickableText color={theme.subText}>TOKEN PAIR</ClickableText>
              {isAllChain && !isMobile && (
                <ClickableText className="network" onClick={() => handleSort(SORT_FIELD.chainId)} color={theme.subText}>
                  Network
                </ClickableText>
              )}
            </TableHeaderLeft>
            <TableHeader isAllChain={isAllChain}>
              <ClickableText className="pool" color={theme.subText}>
                Pool | FEE
              </ClickableText>

              <ClickableText color={theme.subText} end onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                TVL {arrow(SORT_FIELD.tvlUSD)}
              </ClickableText>

              <ClickableText className="avg" color={theme.subText} end onClick={() => handleSort(SORT_FIELD.apr)}>
                AVG APR {arrow(SORT_FIELD.apr)}
                <QuestionHelper text="Average estimated return based on yearly fees of the pool" />
              </ClickableText>

              <ClickableText
                className="volume"
                color={theme.subText}
                end
                onClick={() => handleSort(SORT_FIELD.volumeUSD)}
              >
                Volume 24H {arrow(SORT_FIELD.volumeUSD)}
              </ClickableText>

              <ClickableText className="fee" color={theme.subText} end onClick={() => handleSort(SORT_FIELD.fee)}>
                Fee 24H {arrow(SORT_FIELD.fee)}
              </ClickableText>

              <ClickableText color={theme.subText} end>
                Actions
              </ClickableText>
            </TableHeader>
          </GridWrapper>

          <AutoColumn>
            {sortedPairs.map((pair, i) => {
              if (!pair) return null
              const pairInfo = pair[0]
              const id = `${pair[0].token0.address}_${pair[0].token1.address}`
              const networkInfo = NETWORKS_INFO_MAP[pairInfo.chainId]
              return (
                <React.Fragment key={i}>
                  {isMobile ? (
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
                            activeNetwork={networkInfo}
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
                            <LinkWrapper to={networkPrefix(networkInfo) + 'pool/' + poolData.address}>
                              <GridWrapper
                                isAllChain={isAllChain}
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

                                <ResponsiveGrid isAllChain={isAllChain}>
                                  <Label end={1} fontWeight={400}>
                                    {formatDollarAmount(poolData.tvlUSD)}
                                  </Label>
                                  <ExternalLink
                                    href={getPoolLink(
                                      {
                                        type: 'add',
                                        token0Address: poolData.token0.address,
                                        token1Address: poolData.token1.address,
                                        feeTier: poolData.feeTier,
                                      },
                                      networkInfo
                                    )}
                                    style={{
                                      display: 'flex',
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
                            {i !== pair.length - 1 && <BreakWrapper />}
                          </React.Fragment>
                        ))}
                    </>
                  ) : (
                    <GridWrapper
                      isAllChain={isAllChain}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: openPair === id ? theme.tableHeader : theme.background,
                      }}
                    >
                      <ColumnLeft isAllChain={isAllChain}>
                        <Flex flexDirection="column" justifyContent="center">
                          <DoubleCurrencyLogo
                            address0={pair[0].token0.address}
                            address1={pair[0].token1.address}
                            activeNetwork={networkInfo}
                          />
                          <Label marginTop="8px">
                            {pair[0].token0.symbol} - {pair[0].token1.symbol}
                          </Label>
                        </Flex>
                        {isAllChain && (
                          <Flex justifyContent="center" alignItems="center">
                            <Link to={'/' + networkInfo.route} className="network">
                              <img src={networkInfo.imageURL} width={25} />
                            </Link>
                          </Flex>
                        )}
                      </ColumnLeft>
                      <AutoColumn gap="16px">
                        {pair.map((poolData, index) => {
                          if (index === 0 || openPair === id)
                            return (
                              <React.Fragment key={poolData.address}>
                                <ResponsiveGrid
                                  isAllChain={isAllChain}
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
                                        <LinkWrapper to={networkPrefix(networkInfo) + 'pool/' + poolData.address}>
                                          <Label color={theme.primary}>{shortenAddress(poolData.address)}</Label>
                                        </LinkWrapper>
                                        <CopyHelper toCopy={poolData.address} />
                                      </RowFixed>
                                      <Text fontSize="12px" color={theme.subText}>
                                        Fee = {feeTierPercent(poolData.feeTier)}
                                      </Text>
                                    </AutoColumn>
                                  </Label>

                                  <Label className="tvl" end={1} fontWeight={400}>
                                    {formatDollarAmount(poolData.tvlUSD)}
                                  </Label>
                                  <Label className="avg" end={1}>
                                    {Math.round(poolData.apr * 100) / 100}%
                                  </Label>
                                  <Label className="volume" end={1} fontWeight={400}>
                                    {formatDollarAmount(poolData.volumeUSD)}
                                  </Label>
                                  <Label className="fee" end={1} fontWeight={400}>
                                    {formatDollarAmount(poolData.fee)}
                                  </Label>

                                  <Flex justifyContent="flex-end">
                                    <ExternalLink
                                      href={getPoolLink(
                                        {
                                          type: 'add',
                                          token0Address: poolData.token0.address,
                                          token1Address: poolData.token1.address,
                                          feeTier: poolData.feeTier,
                                        },
                                        networkInfo
                                      )}
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
                                {index !== pair.length - 1 && openPair === id && <BreakWrapper />}
                              </React.Fragment>
                            )
                          return null
                        })}
                      </AutoColumn>
                    </GridWrapper>
                  )}

                  <BreakWrapper />
                </React.Fragment>
              )
            })}
            <Pagination padding={16} setPage={setPage} page={page} maxPage={maxPage} />
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
