import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import styled from 'styled-components'
import { Plus } from 'react-feather'
import { Flex } from 'rebass'

import { useTokenData, usePoolsForToken, useTokenTransactions } from 'state/tokens/hooks'
import { PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink, getPoolLink, generateSwapURL } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import { ExternalLink as StyledExternalLink, HideMedium, OnlyMedium } from '../../theme/components'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, SavedIcon, ButtonOutlined } from 'components/Button'
import { DarkGreyCard, LightGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import TransactionTable from 'components/TransactionsTable'
import { useSavedTokens } from 'state/user/hooks'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import KyberLoading from 'components/Loader/KyberLoading'
import PairPoolsTable from 'components/pools/PairPoolsTable'
import { PoolData } from 'state/pools/reducer'
import Search from 'components/Search'
import { UnSelectable } from 'components'
import CopyHelper from 'components/Copy'
import TokenChart from 'components/TokenChart'

const PriceText = styled(TYPE.label)`
  font-size: 24px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  `}
`

const InfoLayout = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  justify-content: space-between;
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const Label = styled(TYPE.label)`
  font-size: 28px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 24px;
  `}
`

const RelativeDarkGreyCard = styled(DarkGreyCard)`
  position: relative;
  padding: 20px;
`

export default function TokenPage(): JSX.Element {
  let { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]

  address = address.toLowerCase()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(address)
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(address)

  const pairDatas = useMemo(() => {
    const initPairs: { [pairId: string]: PoolData[] } = {}

    const poolsGroupByPair = poolDatas.reduce((pairs, pool) => {
      const pairId = pool.token0.address + '_' + pool.token1.address
      return {
        ...pairs,
        [pairId]: [...(pairs[pairId] || []), pool].sort((a, b) => b.tvlUSD - a.tvlUSD),
      }
    }, initPairs)
    return Object.values(poolsGroupByPair).sort((a, b) => b[0].tvlUSD - a[0].tvlUSD)
  }, [poolDatas])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      {tokenData ? (
        !tokenData.exists ? (
          <LightGreyCard style={{ textAlign: 'center' }}>
            No pool has been created with this token yet. Create one{/* todo namgold: fix this 404 */}
            <StyledExternalLink
              style={{ marginLeft: '4px' }}
              href={getPoolLink(
                {
                  type: 'add',
                  token0Address: address,
                },
                activeNetwork
              )}
            >
              here.
            </StyledExternalLink>
          </LightGreyCard>
        ) : (
          <AutoColumn gap="40px">
            <AutoColumn gap="28px">
              <AutoColumn gap="32px">
                <RowBetween>
                  <AutoRow gap="4px">
                    <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                      <TYPE.breadcrumb>{` Tokens`}</TYPE.breadcrumb>
                    </StyledInternalLink>
                    <UnSelectable>
                      <TYPE.main>{` → `}</TYPE.main>
                    </UnSelectable>
                    <TYPE.breadcrumb>{` ${tokenData.symbol} `}</TYPE.breadcrumb>
                    <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                      <TYPE.link fontWeight={400} fontSize={14}>{` (${shortenAddress(address)}) `}</TYPE.link>
                    </StyledExternalLink>
                    <CopyHelper toCopy={address} />
                  </AutoRow>
                  {!below600 && <Search />}
                </RowBetween>
                <ResponsiveRow align="flex-end">
                  <AutoColumn gap="md">
                    <RowFixed gap="lg">
                      <CurrencyLogo address={address} size="32px" activeNetwork={activeNetwork} />
                      <Label ml="10px">{tokenData.name}</Label>
                      <Label ml="6px">({tokenData.symbol})</Label>
                      <HideMedium>
                        <RowFlat style={{ marginLeft: '16px', marginTop: '8px' }}>
                          <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                          <Percent hideWhenZero value={tokenData.priceUSDChange} />
                        </RowFlat>
                      </HideMedium>
                    </RowFixed>
                  </AutoColumn>
                  <RowFixed>
                    <SavedIcon
                      fill={!!savedTokens?.[activeNetwork.chainId]?.[address]}
                      onClick={() => addSavedToken(activeNetwork.chainId, tokenData)}
                    />
                    <StyledExternalLink
                      href={getPoolLink(
                        {
                          type: 'add',
                          token0Address: address,
                        },
                        activeNetwork
                      )}
                    >
                      <ButtonOutlined width="max-content" mr="12px" height="100%" style={{ height: '38px' }}>
                        <RowBetween>
                          <Plus size={20} />
                          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>Add Liquidity</div>
                        </RowBetween>
                      </ButtonOutlined>
                    </StyledExternalLink>
                    <StyledExternalLink href={generateSwapURL(activeNetwork, address)}>
                      <ButtonPrimary width="100px" style={{ height: '38px' }}>
                        Swap
                      </ButtonPrimary>
                    </StyledExternalLink>
                  </RowFixed>
                </ResponsiveRow>
              </AutoColumn>
              <ContentLayout>
                <InfoLayout>
                  <OnlyMedium>
                    <DarkGreyCard>
                      <AutoColumn gap="16px">
                        <Flex justifyContent="space-between">
                          <TYPE.title fontSize="14px">Price</TYPE.title>
                          <Percent fontSize={12} value={tokenData.priceUSDChange} />
                        </Flex>
                        <TYPE.label fontSize="20px">{formatDollarAmount(tokenData.priceUSD)}</TYPE.label>
                      </AutoColumn>
                    </DarkGreyCard>
                  </OnlyMedium>

                  <DarkGreyCard>
                    <AutoColumn gap="16px">
                      <Flex justifyContent="space-between">
                        <TYPE.title fontSize="14px">Total Value Locked</TYPE.title>
                        <Percent hideWhenZero fontSize={12} value={tokenData.tvlUSDChange} />
                      </Flex>
                      <TYPE.label fontSize="20px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                    </AutoColumn>
                  </DarkGreyCard>
                  <DarkGreyCard>
                    <AutoColumn gap="16px">
                      <Flex justifyContent="space-between">
                        <TYPE.title fontSize="14px">Volume (24H)</TYPE.title>
                        <Percent hideWhenZero fontSize={12} value={tokenData.volumeUSDChange} />
                      </Flex>
                      <TYPE.label fontSize="20px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                    </AutoColumn>
                  </DarkGreyCard>
                  <DarkGreyCard>
                    <AutoColumn gap="16px">
                      <Flex justifyContent="space-between">
                        <TYPE.title fontSize="14px">Fees (24H)</TYPE.title>
                        <Percent hideWhenZero fontSize={12} value={tokenData.feesUSDChange} />
                      </Flex>
                      <TYPE.label fontSize="20px">{formatDollarAmount(tokenData.feesUSD)}</TYPE.label>
                    </AutoColumn>
                  </DarkGreyCard>
                  <DarkGreyCard>
                    <AutoColumn gap="16px">
                      <TYPE.title fontSize="14px">Transactions (24H)</TYPE.title>
                      <TYPE.label fontSize="20px">{tokenData.txCount}</TYPE.label>
                    </AutoColumn>
                  </DarkGreyCard>
                </InfoLayout>
                <RelativeDarkGreyCard>
                  <TokenChart address={tokenData.address} base={tokenData.priceUSD} />
                </RelativeDarkGreyCard>
              </ContentLayout>
            </AutoColumn>

            <AutoColumn gap="16px">
              <TYPE.label fontSize="18px">Pools</TYPE.label>
              <PairPoolsTable pairDatas={pairDatas} />
            </AutoColumn>
            <AutoColumn gap="16px">
              <TYPE.label fontSize="18px">Transactions</TYPE.label>
              {transactions ? (
                <TransactionTable transactions={transactions} />
              ) : (
                <DarkGreyCard>
                  <Flex justifyContent="center">
                    <KyberLoading size={120} />
                  </Flex>
                </DarkGreyCard>
              )}
            </AutoColumn>
          </AutoColumn>
        )
      ) : (
        <Flex justifyContent="center">
          <KyberLoading />
        </Flex>
      )}
    </PageWrapper>
  )
}
