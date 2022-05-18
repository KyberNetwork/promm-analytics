import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart'
import { useProtocolChartData, useProtocolData } from 'state/protocol/hooks'
import { useTransformedVolumeData } from 'hooks/chart'
import { unixToDate } from 'utils/date'
import { VolumeWindow } from 'types'
import { OptionButton } from 'components/Button'
import { TYPE } from 'theme'
import { RowFixed } from 'components/Row'

const VolumeChart = (): React.ReactElement | null => {
  // time window and window size for chart
  const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily)
  const [chartData] = useProtocolChartData()
  const [protocolData] = useProtocolData()

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
  const weeklyVolumeData = useTransformedVolumeData(chartData, 'week')
  const monthlyVolumeData = useTransformedVolumeData(chartData, 'month')

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

  return formattedVolumeData ? (
    <>
      <ResponsiveContainer aspect={60 / 28}>
        <TradingViewChart
          data={
            volumeWindow === VolumeWindow.monthly
              ? monthlyVolumeData
              : volumeWindow === VolumeWindow.weekly
              ? weeklyVolumeData
              : formattedVolumeData
          }
          base={(volumeWindow === VolumeWindow.weekly ? protocolData?.volumeUSDWeek : protocolData?.volumeUSD) ?? 0}
          baseChange={
            volumeWindow === VolumeWindow.weekly ? protocolData?.volumeUSDChangeWeek : protocolData?.volumeUSDChange
          }
          title={
            // (activeNetwork[1] ? 'Total ' : '') +
            'Trading Volume' + (volumeWindow === VolumeWindow.weekly ? ' (7d)' : '')
          }
          // field={volumeWindow === VolumeWindow.weekly ? 'weeklyVolumeUSD' : 'dailyVolumeUSD'}
          width={width ?? 0}
          type={CHART_TYPES.BAR}
          useWeekly={volumeWindow === VolumeWindow.weekly}
        />
      </ResponsiveContainer>
      <RowFixed
        style={{
          top: '100px',
          position: 'absolute',
          left: '20px',
          zIndex: 10,
        }}
      >
        <OptionButton active={volumeWindow === VolumeWindow.daily} onClick={() => setVolumeWindow(VolumeWindow.daily)}>
          <TYPE.body>D</TYPE.body>
        </OptionButton>
        <OptionButton
          style={{ marginLeft: '4px' }}
          active={volumeWindow === VolumeWindow.weekly}
          onClick={() => setVolumeWindow(VolumeWindow.weekly)}
        >
          <TYPE.body>W</TYPE.body>
        </OptionButton>
      </RowFixed>
    </>
  ) : null
}

export default VolumeChart
