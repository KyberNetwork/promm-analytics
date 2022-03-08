import React, { useEffect, useMemo } from 'react'
import { Text } from 'rebass'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import PoolTable from 'components/pools/PoolTable'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'

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
        <PoolTable poolDatas={poolDatas} maxItems={15} />
      </AutoColumn>
    </PageWrapper>
  )
}
