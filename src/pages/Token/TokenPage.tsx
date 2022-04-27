import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  useTokenData,
  usePoolsForToken,
  useTokenChartData,
  useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink, currentTimestamp } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader from 'components/Loader'
import { Plus } from 'react-feather'
import { ExternalLink as StyledExternalLink, HideMedium, OnlyMedium } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonPrimary, SavedIcon, ButtonOutlined } from 'components/Button'
import { DarkGreyCard, LightGreyCard } from 'components/Card'
import { usePoolDatas } from 'state/pools/hooks'
import LineChart from 'components/LineChart/alt'
import { unixToDate } from 'utils/date'
import { ToggleWrapper, ToggleElementFree } from 'components/Toggle/index'
import BarChart from 'components/BarChart/alt'
import CandleChart from 'components/CandleChart'
import TransactionTable from 'components/TransactionsTable'
import { useSavedTokens } from 'state/user/hooks'
import { ONE_HOUR_SECONDS, TimeWindow } from 'constants/intervals'
import { MonoSpace } from 'components/shared'
import dayjs from 'dayjs'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { Flex } from 'rebass'
import Loading from 'components/Loader/Loading'
import PairTable from 'components/pools/PairTable'
import { PoolData } from 'state/pools/reducer'

const PriceText = styled(TYPE.label)`
  font-size: 24px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  margin-top: 16px;
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
  font-size: 32px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 24px;
  `}
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

const DEFAULT_TIME_WINDOW = TimeWindow.WEEK

export default function TokenPage() {
  let { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]

  address = address.toLowerCase()
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(address)
  const poolsForToken = usePoolsForToken(address)
  const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(address)
  const chartData = useTokenChartData(address)

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

  // format for chart component
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

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  // chart labels
  const [view, setView] = useState(ChartView.PRICE)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [timeWindow] = useState(DEFAULT_TIME_WINDOW)

  // pricing data
  const priceData = useTokenPriceData(address, ONE_HOUR_SECONDS, timeWindow)
  const adjustedToCurrent = useMemo(() => {
    if (priceData && tokenData && priceData.length > 0) {
      const adjusted = Object.assign([], priceData)
      adjusted.push({
        time: currentTimestamp() / 1000,
        open: priceData[priceData.length - 1].close,
        close: tokenData?.priceUSD,
        high: tokenData?.priceUSD,
        low: priceData[priceData.length - 1].close,
      })
      return adjusted
    } else {
      return undefined
    }
  }, [priceData, tokenData])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {tokenData ? (
        !tokenData.exists ? (
          <LightGreyCard style={{ textAlign: 'center' }}>
            No pool has been created with this token yet. Create one
            <StyledExternalLink
              style={{ marginLeft: '4px' }}
              href={`https://kyberswap.com/#/proamm/add/${address}?networkId=${activeNetwork.chainId}`}
            >
              here.
            </StyledExternalLink>
          </LightGreyCard>
        ) : (
          <AutoColumn gap="32px">
            <AutoColumn gap="32px">
              <RowBetween>
                <AutoRow gap="4px">
                  <StyledInternalLink to={networkPrefix(activeNetwork)}>
                    <TYPE.main>{`Home → `}</TYPE.main>
                  </StyledInternalLink>
                  <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                    <TYPE.label>{` Tokens `}</TYPE.label>
                  </StyledInternalLink>
                  <TYPE.main>{` → `}</TYPE.main>
                  <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
                  <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                    <TYPE.link>{` (${shortenAddress(address)}) `}</TYPE.link>
                  </StyledExternalLink>
                </AutoRow>
                <RowFixed align="center" justify="center">
                  {/* TODO: add search component */}
                </RowFixed>
              </RowBetween>
              <ResponsiveRow align="flex-end">
                <AutoColumn gap="md">
                  <RowFixed gap="lg">
                    <CurrencyLogo address={address} size="32px" />
                    <Label ml={'10px'}>{tokenData.name}</Label>
                    <Label ml={'6px'}>({tokenData.symbol})</Label>
                    <HideMedium>
                      <RowFlat style={{ marginLeft: '16px', marginTop: '8px' }}>
                        <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                        <Percent value={tokenData.priceUSDChange} />
                      </RowFlat>
                    </HideMedium>
                  </RowFixed>
                </AutoColumn>
                <RowFixed>
                  <SavedIcon
                    fill={!!savedTokens?.[activeNetwork.chainId]?.[address]}
                    onClick={() => addSavedToken(activeNetwork.chainId, tokenData)}
                  />
                  <StyledExternalLink href={`https://kyberswap.com/#/proamm/add/${address}`}>
                    <ButtonOutlined width="max-content" mr="12px" height={'100%'} style={{ height: '38px' }}>
                      <RowBetween>
                        <Plus size={20} />
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>Add Liquidity</div>
                      </RowBetween>
                    </ButtonOutlined>
                  </StyledExternalLink>
                  <StyledExternalLink
                    href={`https://kyberswap.com/#/swap?inputCurrency=${address}&networkId=${activeNetwork.chainId}`}
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
                <OnlyMedium>
                  <DarkGreyCard>
                    <AutoColumn gap="16px">
                      <Flex justifyContent="space-between">
                        <TYPE.label fontSize="14px">Price</TYPE.label>
                        <Percent value={tokenData.priceUSDChange} />
                      </Flex>
                      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.priceUSD)}</TYPE.label>
                    </AutoColumn>
                  </DarkGreyCard>
                </OnlyMedium>

                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <Flex justifyContent="space-between">
                      <TYPE.label fontSize="14px">Total Value Locked</TYPE.label>
                      <Percent value={tokenData.tvlUSDChange} />
                    </Flex>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.tvlUSD)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <Flex justifyContent="space-between">
                      <TYPE.label fontSize="14px">24h Trading Vol</TYPE.label>
                      <Percent value={tokenData.volumeUSDChange} />
                    </Flex>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSD)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <TYPE.label fontSize="14px">7d Trading Vol</TYPE.label>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.volumeUSDWeek)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
                <DarkGreyCard>
                  <AutoColumn gap="16px">
                    <TYPE.label fontSize="14px">24h Fees</TYPE.label>
                    <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.feesUSD)}</TYPE.label>
                  </AutoColumn>
                </DarkGreyCard>
              </InfoLayout>
              <DarkGreyCard>
                <RowBetween align="flex-start">
                  <AutoColumn>
                    <RowFixed>
                      <TYPE.label fontSize="24px" height="30px">
                        <MonoSpace>
                          {latestValue
                            ? formatDollarAmount(latestValue, 2)
                            : view === ChartView.VOL
                            ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                            : view === ChartView.TVL
                            ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                            : formatDollarAmount(tokenData.priceUSD, 2)}
                        </MonoSpace>
                      </TYPE.label>
                    </RowFixed>
                    <TYPE.main height="20px" fontSize="12px">
                      {valueLabel ? (
                        <MonoSpace>{valueLabel} (UTC)</MonoSpace>
                      ) : (
                        <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                      )}
                    </TYPE.main>
                  </AutoColumn>
                  <ToggleWrapper width="180px">
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
                      onClick={() => (view === ChartView.TVL ? setView(ChartView.PRICE) : setView(ChartView.TVL))}
                    >
                      TVL
                    </ToggleElementFree>
                    <ToggleElementFree
                      isActive={view === ChartView.PRICE}
                      fontSize="12px"
                      onClick={() => setView(ChartView.PRICE)}
                    >
                      Price
                    </ToggleElementFree>
                  </ToggleWrapper>
                </RowBetween>
                {view === ChartView.TVL ? (
                  <LineChart
                    data={formattedTvlData}
                    color={theme.primary}
                    minHeight={340}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                  />
                ) : view === ChartView.VOL ? (
                  <BarChart
                    data={formattedVolumeData}
                    color={theme.primary}
                    minHeight={340}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                  />
                ) : view === ChartView.PRICE ? (
                  adjustedToCurrent ? (
                    <CandleChart
                      data={adjustedToCurrent}
                      setValue={setLatestValue}
                      setLabel={setValueLabel}
                      color={theme.primary}
                    />
                  ) : (
                    <Flex width="100%" height="80%" justifyContent="center" alignItems="center">
                      <Loading size={120} />
                    </Flex>
                  )
                ) : null}
              </DarkGreyCard>
            </ContentLayout>
            <TYPE.label fontSize="18px">Pools</TYPE.label>
            <PairTable pairDatas={pairDatas} />
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
        )
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}
