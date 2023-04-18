import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Plus } from 'react-feather'
import { Flex } from 'rebass'
import { useMedia } from 'react-use'

import { PageWrapper } from 'pages/styled'
import {
  addNetworkIdQueryString,
  feeTierPercent,
  FEE_BASE_UNITS,
  getEtherscanLink,
  getPoolLink,
  shortenAddress,
} from 'utils'
import Column, { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, SavedIcon, ButtonOutlined } from 'components/Button'
import { DarkGreyCard, GreyCard } from 'components/Card'
import { usePoolDatas, usePoolTransactions } from 'state/pools/hooks'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import KyberLoading from 'components/Loader/KyberLoading'
import Search from 'components/Search'
import { UnSelectable } from 'components'
import CopyHelper from 'components/Copy'
import Panel from 'components/Panel'
import FormattedName from 'components/FormattedName'
import PoolChart from 'components/PoolChart'
import usePrices from 'hooks/useTokensPrice'
import { KYBERSWAP_URL } from 'constants/env'

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const InfoLayout = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  justify-content: space-between;
`

const TokenButton = styled(GreyCard)`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  // grid-template-columns: auto auto auto;
  grid-template-areas: 'name address token0 token1 button';
  column-gap: 60px;
  row-gap: 1rem;
  justify-content: space-between;

  @media screen and (max-width: 1300px) {
    grid-template-areas:
      'name token0 button'
      'address token1 button';
  }
  @media screen and (max-width: 700px) {
    grid-template-areas: 'name' 'address' 'token0' 'token1' 'button';
    align-items: stretch;
    > * {
      grid-column: 1 / 5;
    }
  }
`

const ResponsiveRow = styled(RowBetween)`
  column-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const RelativeDarkGreyCard = styled(DarkGreyCard)`
  position: relative;
  padding: 20px;
`

export default function PoolPage(): JSX.Element {
  let { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]
  address = address.toLowerCase()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const theme = useTheme()

  // token data
  const poolData = usePoolDatas([address])[0]

  const prices = usePrices([poolData?.token0?.address, poolData?.token1?.address].filter(Boolean))

  // const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address, prices)

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      {poolData ? (
        <AutoColumn gap="40px">
          <AutoColumn gap="28px">
            <AutoColumn gap="32px">
              <RowBetween>
                <AutoRow gap="4px">
                  <StyledInternalLink to={networkPrefix(activeNetwork) + 'pools'}>
                    <TYPE.breadcrumb>{` Pools `}</TYPE.breadcrumb>
                  </StyledInternalLink>
                  <UnSelectable>
                    <TYPE.main>{` → `}</TYPE.main>
                  </UnSelectable>
                  <TYPE.breadcrumb>{` ${poolData.token0.symbol}/${poolData.token1.symbol} ${feeTierPercent(
                    poolData.feeTier
                  )} `}</TYPE.breadcrumb>

                  <RowFixed>
                    <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                      <TYPE.link fontWeight={400} fontSize={14}>{` (${shortenAddress(address)}) `}</TYPE.link>
                    </StyledExternalLink>
                    <CopyHelper toCopy={address} />
                  </RowFixed>
                </AutoRow>
                {!below600 && <Search />}
              </RowBetween>
              <ResponsiveRow align="flex-start">
                <AutoColumn gap="lg">
                  <RowFixed>
                    <DoubleCurrencyLogo
                      address0={poolData.token0.address}
                      address1={poolData.token1.address}
                      size={24}
                      activeNetwork={activeNetwork}
                    />
                    <TYPE.label ml="8px" mr="8px" fontSize="28px">{` ${poolData.token0.symbol}-${
                      poolData.token1.symbol
                    } Pool | Fee = ${feeTierPercent(poolData.feeTier)}`}</TYPE.label>
                  </RowFixed>
                  <ResponsiveRow style={{ justifyContent: 'unset' }}>
                    <StyledInternalLink to={networkPrefix(activeNetwork) + 'token/' + poolData.token0.address}>
                      <TokenButton>
                        <RowFixed>
                          <CurrencyLogo address={poolData.token0.address} size="20px" activeNetwork={activeNetwork} />
                          <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                            {`1 ${poolData.token0.symbol} = ${formatAmount(poolData.token1Price, 4)} ${
                              poolData.token1.symbol
                            }`}{' '}
                            ({formatDollarAmount(prices[0])})
                          </TYPE.label>
                        </RowFixed>
                      </TokenButton>
                    </StyledInternalLink>
                    <StyledInternalLink to={networkPrefix(activeNetwork) + 'token/' + poolData.token1.address}>
                      <TokenButton>
                        <RowFixed>
                          <CurrencyLogo address={poolData.token1.address} size="20px" activeNetwork={activeNetwork} />
                          <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                            {`1 ${poolData.token1.symbol} = ${formatAmount(poolData.token0Price, 4)} ${
                              poolData.token0.symbol
                            }`}{' '}
                            ({formatDollarAmount(prices[1])})
                          </TYPE.label>
                        </RowFixed>
                      </TokenButton>
                    </StyledInternalLink>
                  </ResponsiveRow>
                </AutoColumn>
                <RowFixed>
                  <SavedIcon
                    fill={!!savedPools[activeNetwork.chainId]?.[poolData.address]}
                    onClick={() => addSavedPool(activeNetwork.chainId, poolData)}
                  />

                  <StyledExternalLink
                    href={getPoolLink(
                      {
                        type: 'add',
                        token0Address: poolData.token0.address,
                        token1Address: poolData.token1.address,
                        feeTier: poolData.feeTier,
                      },
                      activeNetwork
                    )}
                  >
                    <ButtonOutlined width="max-content" mr="12px" style={{ height: '38px' }}>
                      <RowBetween>
                        <Plus size={20} />
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>Add Liquidity</div>
                      </RowBetween>
                    </ButtonOutlined>
                  </StyledExternalLink>
                  <StyledExternalLink
                    href={addNetworkIdQueryString(
                      `${KYBERSWAP_URL}/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`,
                      activeNetwork
                    )}
                  >
                    <ButtonPrimary width="100px" style={{ height: '38px' }}>
                      Trade
                    </ButtonPrimary>
                  </StyledExternalLink>
                </RowFixed>
              </ResponsiveRow>
            </AutoColumn>

            <ContentLayout>
              <InfoLayout>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <RowBetween>
                      <TYPE.title fontSize="14px">Total Value Locked</TYPE.title>
                      <Percent hideWhenZero fontSize={12} value={poolData.tvlUSDChange} />
                    </RowBetween>
                    <TYPE.label fontSize="20px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <RowBetween>
                      <TYPE.title fontSize="14px">Volume (24H)</TYPE.title>
                      <Percent hideWhenZero fontSize={12} value={poolData.volumeUSDChange} />
                    </RowBetween>
                    <TYPE.label fontSize="20px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <TYPE.title fontSize="14px">Fees (24H)</TYPE.title>
                    <TYPE.label fontSize="20px">{formatDollarAmount(poolData.fee)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <TYPE.title fontSize="14px">Pooled Tokens</TYPE.title>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="20px" ml="8px">
                        {formatAmount(poolData.tvlToken0)} {poolData.token0.symbol}
                      </TYPE.label>
                    </RowFixed>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="20px" ml="8px">
                        {formatAmount(poolData.tvlToken1)} {poolData.token1.symbol}
                      </TYPE.label>
                    </RowFixed>
                  </AutoColumn>
                </DarkGreyCard>
              </InfoLayout>
              <RelativeDarkGreyCard>
                <PoolChart address={address} />
              </RelativeDarkGreyCard>
            </ContentLayout>
          </AutoColumn>

          <AutoColumn gap="16px">
            <TYPE.label fontSize="18px">Latest Transactions</TYPE.label>
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
          <AutoColumn gap="16px">
            <TYPE.label fontSize="18px">Pool Information</TYPE.label>

            <Panel p={20}>
              <TokenDetailsLayout>
                <Column style={{ gridArea: 'name' }}>
                  <TYPE.main color={theme.subText} fontSize="12px">
                    PAIR NAME
                  </TYPE.main>
                  <TYPE.main style={{ marginTop: '.75rem' }} fontSize="18px">
                    <RowFixed>
                      <FormattedName text={poolData.token0?.symbol ?? ''} maxCharacters={8} />
                      -
                      <FormattedName text={poolData.token1?.symbol ?? ''} maxCharacters={8} />
                    </RowFixed>
                  </TYPE.main>
                </Column>
                <Column style={{ gridArea: 'address' }}>
                  <TYPE.main color={theme.subText} fontSize="12px">
                    PAIR ADDRESS
                  </TYPE.main>
                  <RowFixed align="flex-end">
                    <TYPE.main style={{ marginTop: '12px' }} fontSize="18px">
                      {poolData.address.slice(0, 6) + '...' + poolData.address.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={poolData.address} />
                  </RowFixed>
                </Column>
                <Column style={{ gridArea: 'token0' }}>
                  <TYPE.main color={theme.subText} fontSize="12px">
                    <RowFixed>
                      <FormattedName
                        style={{ color: theme.subText }}
                        text={poolData.token0?.symbol ?? ''}
                        maxCharacters={8}
                      />{' '}
                      <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                    </RowFixed>
                  </TYPE.main>
                  <RowFixed align="flex-end">
                    <TYPE.main style={{ marginTop: '12px' }} fontSize="18px">
                      {poolData.token0 &&
                        poolData.token0.address.slice(0, 6) + '...' + poolData.token0.address.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper margin="none" toCopy={poolData.token0?.address} />
                  </RowFixed>
                </Column>
                <Column style={{ gridArea: 'token1' }}>
                  <TYPE.main fontSize="12px" color={theme.subText}>
                    <RowFixed>
                      <FormattedName
                        style={{ color: theme.subText }}
                        text={poolData.token1?.symbol ?? ''}
                        maxCharacters={8}
                      />{' '}
                      <span style={{ marginLeft: '4px' }}>ADDRESS</span>
                    </RowFixed>
                  </TYPE.main>
                  <RowFixed align="flex-end">
                    <TYPE.main style={{ marginTop: '12px' }} fontSize={18}>
                      {poolData.token1 &&
                        poolData.token1.address.slice(0, 6) + '...' + poolData.token1.address.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={poolData.token1?.address} />
                  </RowFixed>
                </Column>
                <Column style={{ gridArea: 'button' }}>
                  <StyledExternalLink href={getEtherscanLink(activeNetwork, poolData.address, 'address')}>
                    <ButtonPrimary style={{ height: 'fit-content', width: 'fit-content' }}>
                      <span>
                        View on <span style={{ whiteSpace: 'nowrap' }}>{activeNetwork.etherscanName} ↗</span>
                      </span>
                    </ButtonPrimary>
                  </StyledExternalLink>
                </Column>
              </TokenDetailsLayout>
            </Panel>
          </AutoColumn>
        </AutoColumn>
      ) : (
        <Flex justifyContent="center">
          <KyberLoading size={120} />
        </Flex>
      )}
    </PageWrapper>
  )
}
