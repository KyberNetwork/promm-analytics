import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart'
import { useProtocolChartData, useProtocolData } from 'state/protocol/hooks'
import { unixToDate } from 'utils/date'

const TVLChart = (): React.ReactElement | null => {
  // time window and window size for chart
  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  // update the width on a window resize
  const ref = useRef<HTMLDivElement | null>(null)
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(ref?.current?.clientWidth)
  useEffect(() => {
    if (!isClient) {
      return
    }
    function handleResize() {
      setWidth(ref?.current?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  return formattedTvlData ? (
    <ResponsiveContainer aspect={60 / 28}>
      <TradingViewChart
        data={formattedTvlData}
        base={protocolData?.tvlUSD || 0}
        baseChange={10}
        title={'Liquidity'}
        width={50}
        type={CHART_TYPES.AREA}
      />
    </ResponsiveContainer>
  ) : null
}

export default TVLChart
