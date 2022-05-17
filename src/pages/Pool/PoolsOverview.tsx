import React, { useEffect, useMemo } from 'react'
import { Text } from 'rebass'
import { useMedia } from 'react-use'

import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import { PoolData } from 'state/pools/reducer'
import PairTable from 'components/pools/PairTable'
import Search from 'components/Search'
import { RowBetween } from 'components/Row'

export default function PoolOverview(): JSX.Element {
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
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <AutoColumn gap="lg">
        <RowBetween>
          <Text fontWeight="500" fontSize="24px">
            All Pools
          </Text>
          {!below600 && <Search />}
        </RowBetween>

        <PairTable pairDatas={pairDatas} />
      </AutoColumn>
    </PageWrapper>
  )
}
