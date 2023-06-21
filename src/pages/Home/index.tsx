import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'

import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { useProtocolData, useProtocolTransactions } from 'state/protocol/hooks'
import { DarkGreyCard } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { ButtonText, StyledInternalLink } from '../../theme/components'
import TokenTable from 'components/tokens/TokenTable'
import { PageWrapper } from 'pages/styled'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import TransactionsTable from '../../components/TransactionsTable'
import { useAllTokenData } from 'state/tokens/hooks'
import useAggregatorVolume from 'hooks/useAggregatorVolume'
import { PoolData } from 'state/pools/reducer'
import PairPoolsTable from 'components/pools/PairPoolsTable'
import Panel from 'components/Panel'
import GlobalChart, { CHART_VIEW } from './components/GlobalChart'
import Search from 'components/Search'
import { UnSelectable } from 'components'
import { QuestionHelper } from 'components/QuestionHelper'

const ChartWrapper = styled.div`
  width: 49%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const StatisticWrapper = styled.div`
  display: flex;
  gap: 32px;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    gap: 16px;
    `}
`

const TableTitle = styled(TYPE.label)`
  font-size: 18px;
`

const Separator = styled(UnSelectable)`
  user-select: none;
  font-size: 12px;
`

export default function Home(): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()

  const [protocolData] = useProtocolData()
  const [transactions] = useProtocolTransactions()

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

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

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])

  const [showTotalVol, setShowTotalVol] = useState(true)
  const aggregatorVol = useAggregatorVolume()
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <AutoColumn gap="40px">
        <AutoColumn gap="24px">
          <Flex
            alignItems={below600 ? 'flex-start' : 'center'}
            justifyContent="space-between"
            flexDirection={below600 ? 'column-reverse' : 'row'}
          >
            <TYPE.label fontSize="24px" style={{ marginTop: below600 ? '20px' : '0' }}>
              Summary
            </TYPE.label>
            <Search />
          </Flex>

          <StatisticWrapper>
            <DarkGreyCard>
              <AutoColumn gap="8px">
                <RowBetween>
                  <Flex>
                    <TYPE.title>Trading Volume</TYPE.title>
                    <QuestionHelper text="Total trading volume through aggregator and liquidity pools on all chains" />
                  </Flex>

                  <RowFixed>
                    <ButtonText
                      onClick={() => setShowTotalVol(true)}
                      style={{
                        fontWeight: 500,
                        fontSize: '12px',
                        color: showTotalVol ? theme.primary : theme.subText,
                        marginRight: '4.25px',
                      }}
                    >
                      All time
                    </ButtonText>
                    <Separator>|</Separator>
                    <ButtonText
                      onClick={() => setShowTotalVol(false)}
                      style={{
                        fontWeight: 500,
                        marginLeft: '4.25px',
                        fontSize: '12px',
                        color: !showTotalVol ? theme.primary : theme.subText,
                      }}
                    >
                      24H
                    </ButtonText>
                  </RowFixed>
                </RowBetween>
                <RowFixed mr="20px">
                  <Text fontWeight="500" fontSize="18px">
                    {formatDollarAmount(showTotalVol ? aggregatorVol.totalVolume : aggregatorVol.last24hVolume)}
                  </Text>
                </RowFixed>
              </AutoColumn>
            </DarkGreyCard>
            <DarkGreyCard>
              <TYPE.title>Fees (24H)</TYPE.title>
              <RowBetween style={{ marginTop: '8px' }}>
                <TYPE.label fontSize="18px">{formatDollarAmount(protocolData?.feesUSD)}</TYPE.label>
                <Percent value={protocolData?.feeChange} fontSize={12} />
              </RowBetween>
            </DarkGreyCard>
            <DarkGreyCard>
              <TYPE.title>Transactions (24H)</TYPE.title>
              <RowBetween style={{ marginTop: '8px' }}>
                <TYPE.label fontSize="18px">{protocolData?.txCount}</TYPE.label>
                <Percent value={protocolData?.txCountChange} fontSize={12} />
              </RowBetween>
            </DarkGreyCard>
          </StatisticWrapper>

          <ResponsiveRow>
            <ChartWrapper>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart chartView={CHART_VIEW.TVL} />
              </Panel>
            </ChartWrapper>
            <ChartWrapper>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart chartView={CHART_VIEW.VOLUME} />
              </Panel>
            </ChartWrapper>
          </ResponsiveRow>
        </AutoColumn>
        <AutoColumn gap="16px">
          <RowBetween>
            <TableTitle>Top Tokens</TableTitle>
            <StyledInternalLink to="tokens" fontSize="14px">
              Explore
            </StyledInternalLink>
          </RowBetween>
          <TokenTable tokenDatas={formattedTokens} maxItems={5} />
        </AutoColumn>
        <AutoColumn gap="16px">
          <RowBetween>
            <TableTitle>Top Pools</TableTitle>
            <StyledInternalLink to="pools" fontSize="14px">
              Explore
            </StyledInternalLink>
          </RowBetween>
          <PairPoolsTable pairDatas={pairDatas} maxItems={5} />
        </AutoColumn>
        <AutoColumn gap="16px">
          <RowBetween>
            <TableTitle>Latest Transactions</TableTitle>
          </RowBetween>
          {transactions ? <TransactionsTable transactions={transactions} maxItems={5} /> : null}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  )
}
