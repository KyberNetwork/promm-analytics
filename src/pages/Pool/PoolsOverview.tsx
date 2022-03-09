import React, { useEffect, useMemo } from 'react'
import { Text } from 'rebass'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import PoolTable from 'components/pools/PoolTable'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import { PoolData } from 'state/pools/reducer'
import PairTable from 'components/pools/PairTable'

export default function PoolPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  return (
    <PageWrapper>
      <AutoColumn gap="lg">
        {/* <TYPE.main>Your Watchlist</TYPE.main> */}
        {/* watchlistPools.length > 0 ? (
          <PoolTable poolDatas={watchlistPools} />
        ) : (
          <DarkGreyCard>
            <TYPE.main>Saved pools will appear here</TYPE.main>
          </DarkGreyCard>
        ) */}
        {/* <HideSmall>
          <DarkGreyCard style={{ paddingTop: '12px' }}>
            <AutoColumn gap="md">
              <TYPE.mediumHeader fontSize="16px">Trending by 24H Volume</TYPE.mediumHeader>
              <TopPoolMovers />
            </AutoColumn>
          </DarkGreyCard>
        </HideSmall> */}
        <Text fontWeight="500" fontSize="24px">
          All Pools
        </Text>

        <PairTable pairDatas={pairDatas} maxItems={15} />
      </AutoColumn>
    </PageWrapper>
  )
}
