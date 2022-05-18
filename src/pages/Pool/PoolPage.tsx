import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Plus } from 'react-feather'
import { Flex } from 'rebass'
import { useMedia } from 'react-use'

import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { feeTierPercent, getEtherscanLink, shortenAddress } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader from 'components/Loader'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, SavedIcon, ButtonOutlined } from 'components/Button'
import { DarkGreyCard, GreyCard, GreyBadge } from 'components/Card'
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/pools/hooks'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import TransactionTable from 'components/TransactionsTable'
import { useSavedPools } from 'state/user/hooks'
import DensityChart from 'components/DensityChart'
import { MonoSpace } from 'components/shared'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { ChainId } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
import Loading from 'components/Loader/Loading'
import Search from 'components/Search'

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
  border: 1px solid ${({ theme }) => theme.border}
  background: ${({ theme }) => theme.background};
  :hover {
    cursor: pointer;
    opacity: 0.6;
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

const ToggleRow = styled(RowBetween)`
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
  DENSITY,
  FEES,
}

export default function PoolPage(): JSX.Element {
  const { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor()
  const theme = useTheme()

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalValueLockedUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(
    () =>
      chartData?.map((day) => ({
        time: unixToDate(day.date),
        value: day.volumeUSD,
      })) ?? [],
    [chartData]
  )

  const formattedFeesUSD = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.feesUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  //watchlist
  const [savedPools, addSavedPool] = useSavedPools()
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {poolData ? (
        <AutoColumn gap="32px">
          <RowBetween>
            <AutoRow gap="4px">
              <StyledInternalLink to={networkPrefix(activeNetwork)}>
                <TYPE.main>{`Home → `}</TYPE.main>
              </StyledInternalLink>
              <StyledInternalLink to={networkPrefix(activeNetwork) + 'pools'}>
                <TYPE.label>{` Pools `}</TYPE.label>
              </StyledInternalLink>
              <TYPE.main>{` → `}</TYPE.main>
              <TYPE.label>{` ${poolData.token0.symbol}/${poolData.token1.symbol} ${feeTierPercent(
                poolData.feeTier
              )} `}</TYPE.label>

              <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                <TYPE.link>{` (${shortenAddress(address)}) `}</TYPE.link>
              </StyledExternalLink>
            </AutoRow>
            {!below600 && <Search />}
          </RowBetween>
          <ResponsiveRow align="flex-end">
            <AutoColumn gap="lg">
              <RowFixed>
                <DoubleCurrencyLogo
                  address0={poolData.token0.address}
                  address1={poolData.token1.address}
                  size={24}
                  activeNetwork={activeNetwork}
                />
                <TYPE.label
                  ml="8px"
                  mr="8px"
                  fontSize="24px"
                >{` ${poolData.token0.symbol}/${poolData.token1.symbol} `}</TYPE.label>
                <GreyBadge>{feeTierPercent(poolData.feeTier)}</GreyBadge>
                <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size="26px" />
              </RowFixed>
              <ResponsiveRow>
                <StyledInternalLink to={networkPrefix(activeNetwork) + 'token/' + poolData.token0.address}>
                  <TokenButton>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                        {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, 4)} ${
                          poolData.token1.symbol
                        }`}
                      </TYPE.label>
                    </RowFixed>
                  </TokenButton>
                </StyledInternalLink>
                <StyledInternalLink to={networkPrefix(activeNetwork) + 'token/' + poolData.token1.address}>
                  <TokenButton>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                        {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, 4)} ${
                          poolData.token0.symbol
                        }`}
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
                href={`https://kyberswap.com/#/proamm/add/${poolData.token0.address}/${poolData.token1.address}/${poolData.feeTier}?networkId=${activeNetwork.chainId}`}
              >
                <ButtonOutlined width="max-content" mr="12px" style={{ height: '38px' }}>
                  <RowBetween>
                    <Plus size={20} />
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>Add Liquidity</div>
                  </RowBetween>
                </ButtonOutlined>
              </StyledExternalLink>
              <StyledExternalLink
                href={`https://kyberswap.com/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}&networkId=${activeNetwork.chainId}`}
              >
                <ButtonPrimary width="100px" style={{ height: '38px' }}>
                  Trade
                </ButtonPrimary>
              </StyledExternalLink>
            </RowFixed>
          </ResponsiveRow>

          <ContentLayout>
            <InfoLayout>
              <DarkGreyCard>
                <AutoColumn gap="16px">
                  <TYPE.label fontSize="14px">Total Tokens Locked</TYPE.label>
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token0.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="14px" ml="8px">
                        {poolData.token0.symbol}
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.label fontSize="14px">{formatAmount(poolData.tvlToken0)}</TYPE.label>
                  </RowBetween>
                  <RowBetween>
                    <RowFixed>
                      <CurrencyLogo address={poolData.token1.address} size="20px" activeNetwork={activeNetwork} />
                      <TYPE.label fontSize="14px" ml="8px">
                        {poolData.token1.symbol}
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.label fontSize="14px">{formatAmount(poolData.tvlToken1)}</TYPE.label>
                  </RowBetween>
                </AutoColumn>
              </DarkGreyCard>
              <DarkGreyCard>
                <AutoColumn gap="16px">
                  <RowBetween>
                    <TYPE.label fontSize="14px">TVL</TYPE.label>
                    <Percent value={poolData.tvlUSDChange} />
                  </RowBetween>
                  <TYPE.label fontSize="24px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label>
                </AutoColumn>
              </DarkGreyCard>
              <DarkGreyCard>
                <AutoColumn gap="16px">
                  <RowBetween>
                    <TYPE.label fontSize="14px">Volume 24h</TYPE.label>
                    <Percent value={poolData.volumeUSDChange} />
                  </RowBetween>
                  <TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label>
                </AutoColumn>
              </DarkGreyCard>
              <DarkGreyCard>
                <AutoColumn gap="16px">
                  <TYPE.label fontSize="14px">24h Fees</TYPE.label>
                  <TYPE.label fontSize="24px">
                    {formatDollarAmount(poolData.volumeUSD * (poolData.feeTier / 1000000))}
                  </TYPE.label>
                </AutoColumn>
              </DarkGreyCard>
            </InfoLayout>
            <DarkGreyCard>
              <ToggleRow align="flex-start">
                <AutoColumn>
                  <TYPE.label fontSize="24px" height="30px">
                    <MonoSpace>
                      {latestValue !== undefined
                        ? formatDollarAmount(latestValue)
                        : view === ChartView.VOL
                        ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                        : view === ChartView.FEES
                        ? formatDollarAmount(formattedFeesUSD[formattedFeesUSD.length - 1]?.value)
                        : view === ChartView.DENSITY
                        ? ''
                        : formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}{' '}
                    </MonoSpace>
                  </TYPE.label>
                  <TYPE.main height="20px" fontSize="12px">
                    {valueLabel ? <MonoSpace>{valueLabel} (UTC)</MonoSpace> : ''}
                  </TYPE.main>
                </AutoColumn>
                <ToggleWrapper width="240px">
                  <ToggleElementFree
                    isActive={view === ChartView.VOL}
                    fontSize="12px"
                    onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
                  >
                    Volume
                  </ToggleElementFree>
                  <ToggleElementFree
                    isActive={view === ChartView.TVL}
                    fontSize="12px"
                    onClick={() => (view === ChartView.TVL ? setView(ChartView.DENSITY) : setView(ChartView.TVL))}
                  >
                    TVL
                  </ToggleElementFree>
                  {activeNetwork.chainId === ChainId.ARBITRUM ? null : (
                    <ToggleElementFree
                      isActive={view === ChartView.DENSITY}
                      fontSize="12px"
                      onClick={() => (view === ChartView.DENSITY ? setView(ChartView.VOL) : setView(ChartView.DENSITY))}
                    >
                      Liquidity
                    </ToggleElementFree>
                  )}
                  <ToggleElementFree
                    isActive={view === ChartView.FEES}
                    fontSize="12px"
                    onClick={() => (view === ChartView.FEES ? setView(ChartView.TVL) : setView(ChartView.FEES))}
                  >
                    Fees
                  </ToggleElementFree>
                </ToggleWrapper>
              </ToggleRow>
              {view === ChartView.TVL ? (
                <LineChart
                  data={formattedTvlData}
                  setLabel={setValueLabel}
                  color={theme.primary}
                  minHeight={340}
                  setValue={setLatestValue}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : view === ChartView.VOL ? (
                <BarChart
                  data={formattedVolumeData}
                  color={theme.primary}
                  minHeight={340}
                  setValue={setLatestValue}
                  setLabel={setValueLabel}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : view === ChartView.FEES ? (
                <BarChart
                  data={formattedFeesUSD}
                  color={theme.primary}
                  minHeight={340}
                  setValue={setLatestValue}
                  setLabel={setValueLabel}
                  value={latestValue}
                  label={valueLabel}
                />
              ) : (
                <DensityChart address={address} />
              )}
            </DarkGreyCard>
          </ContentLayout>

          <TYPE.label fontSize="18px">Transactions</TYPE.label>
          {transactions ? (
            <TransactionTable transactions={transactions} />
          ) : (
            <DarkGreyCard>
              <Flex justifyContent="center">
                <Loading size={120} />
              </Flex>
            </DarkGreyCard>
          )}
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}
