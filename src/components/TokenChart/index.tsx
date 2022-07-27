import React, { useState, useRef, useEffect } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { AutoRow, RowBetween, RowFixed } from '../Row'

import { toK, toNiceDate, toNiceDateYear, getTimeframe } from '../../utils'
import { darken } from 'polished'
import { useMedia, usePrevious } from 'react-use'
import DropdownSelect from '../DropdownSelect'
import { AutoColumn } from '../Column'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import KyberLoading from 'components/Loader/KyberLoading'
import useTheme from 'hooks/useTheme'
import { useDarkModeManager } from 'state/user/hooks'
import { OptionButton } from 'components/Button'
import { formatDollarAmount } from 'utils/numbers'
import { useTokenChartData, useTokenPriceData } from 'state/tokens/hooks'
import CandleStickChart from 'components/CandleChart/index2'
import { ApplicationModal } from 'state/application/actions'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 350px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

enum CHART_VIEW {
  VOLUME = 'Volume',
  TVL = 'TVL',
  PRICE = 'Price',
  LINE_PRICE = 'Price (Line)',
}

type TokenChartProps = {
  address: string
  base: number
}

const TokenChart = ({ address, base }: TokenChartProps): JSX.Element => {
  // settings for the window and candle width
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.PRICE)

  const [darkMode] = useDarkModeManager()
  const theme = useTheme()
  const color = theme.primary
  const textColor = darkMode ? 'white' : 'black'

  // reset view on new address
  const addressPrev = usePrevious(address)
  useEffect(() => {
    if (address !== addressPrev && addressPrev) {
      setChartFilter(CHART_VIEW.TVL)
    }
  }, [address, addressPrev])

  let chartData = useTokenChartData(address)

  const [timeWindow, setTimeWindow] = useState(TimeframeOptions.ONE_DAY)

  const priceData = useTokenPriceData(
    address,
    timeWindow === TimeframeOptions.FOUR_HOURS
      ? 30
      : timeWindow === TimeframeOptions.ONE_DAY
      ? 120
      : timeWindow === TimeframeOptions.THERE_DAYS
      ? 300
      : 3600,
    timeWindow
  )

  const below960 = useMedia('(max-width: 960px)')
  const below600 = useMedia('(max-width: 600px)')

  const utcStartTime = getTimeframe(timeWindow)

  chartData = chartData?.filter((entry) => entry.date >= utcStartTime)

  // update the width on a window resize
  const ref = useRef<ResponsiveContainer>(null)
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState((ref?.current as any | undefined)?.container?.clientWidth)
  useEffect(() => {
    if (!isClient) {
      return
    }
    function handleResize() {
      setWidth((ref?.current as any | undefined)?.container?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  const { ONE_DAY, FOUR_HOURS, ALL_TIME, ...timeWindowOptionsExcept1Day } = TimeframeOptions
  const { ALL_TIME: alltime, ...timeWindowOptionsExceptAllTime } = TimeframeOptions

  const height = below960 ? 398 : 292

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={20}>
          <DropdownSelect
            name={ApplicationModal.CHART_VIEW_DROPDOWN}
            options={CHART_VIEW}
            active={chartFilter}
            setActive={(value: CHART_VIEW) => {
              setChartFilter(value)
              if (value === CHART_VIEW.TVL || value === CHART_VIEW.VOLUME) setTimeWindow(TimeframeOptions.THERE_DAYS)
            }}
            color={color}
          />
          <DropdownSelect
            name={ApplicationModal.TIME_DROPDOWN}
            options={
              [CHART_VIEW.TVL, CHART_VIEW.VOLUME].includes(chartFilter)
                ? timeWindowOptionsExcept1Day
                : timeWindowOptionsExceptAllTime
            }
            active={timeWindow}
            setActive={setTimeWindow}
            color={color}
          />
        </RowBetween>
      ) : (
        <RowBetween mb={20} align="flex-start">
          <RowFixed style={{ background: theme.buttonBlack, borderRadius: '999px' }}>
            <OptionButton
              active={chartFilter === CHART_VIEW.PRICE}
              onClick={() => {
                setChartFilter(CHART_VIEW.PRICE)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Price
            </OptionButton>

            <OptionButton
              active={chartFilter === CHART_VIEW.LINE_PRICE}
              onClick={() => {
                setChartFilter(CHART_VIEW.LINE_PRICE)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Price (Line)
            </OptionButton>

            <OptionButton
              active={chartFilter === CHART_VIEW.TVL}
              onClick={() => {
                setChartFilter(CHART_VIEW.TVL)
                setTimeWindow(TimeframeOptions.THERE_DAYS)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              TVL
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => {
                setChartFilter(CHART_VIEW.VOLUME)
                setTimeWindow(TimeframeOptions.THERE_DAYS)
              }}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Volume
            </OptionButton>
          </RowFixed>
          <AutoColumn justify="flex-end">
            <AutoRow justify="flex-end" align="flex-start" style={{ width: 'fit-content', gap: '6px' }}>
              {[CHART_VIEW.PRICE, CHART_VIEW.LINE_PRICE].includes(chartFilter) && (
                <>
                  <OptionButton
                    active={timeWindow === TimeframeOptions.FOUR_HOURS}
                    onClick={() => setTimeWindow(TimeframeOptions.FOUR_HOURS)}
                  >
                    4H
                  </OptionButton>

                  <OptionButton
                    active={timeWindow === TimeframeOptions.ONE_DAY}
                    onClick={() => setTimeWindow(TimeframeOptions.ONE_DAY)}
                  >
                    1D
                  </OptionButton>
                </>
              )}

              <OptionButton
                active={timeWindow === TimeframeOptions.THERE_DAYS}
                onClick={() => setTimeWindow(TimeframeOptions.THERE_DAYS)}
              >
                3D
              </OptionButton>
              <OptionButton
                active={timeWindow === TimeframeOptions.WEEK}
                onClick={() => setTimeWindow(TimeframeOptions.WEEK)}
              >
                1W
              </OptionButton>
              <OptionButton
                active={timeWindow === TimeframeOptions.MONTH}
                onClick={() => setTimeWindow(TimeframeOptions.MONTH)}
              >
                1M
              </OptionButton>
            </AutoRow>
            {/* <Text color={theme.subText} fontSize={10} marginTop="12px">
              {![CHART_VIEW.LINE_PRICE, CHART_VIEW.PRICE].includes(chartFilter)
                ? ' '
                : timeWindow === TimeframeOptions.FOUR_HOURS
                ? '30s'
                : timeWindow === TimeframeOptions.ONE_DAY
                ? '2 Mins'
                : timeWindow === TimeframeOptions.THERE_DAYS
                ? '5 Mins'
                : '1 Hr'}
            </Text> */}
            <Text color={theme.subText} fontSize={10} marginTop="12px">
              &nbsp;
            </Text>
          </AutoColumn>
        </RowBetween>
      )}
      {chartFilter === CHART_VIEW.TVL && chartData && (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={120}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
              scale="time"
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={(tick) => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={true}
              formatter={(val: number) => formatDollarAmount(val)}
              labelFormatter={(label) => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key={'other'}
              dataKey={'totalValueLockedUSD'}
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'TVL'}
              yAxisId={0}
              stroke={darken(0.12, color)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {[CHART_VIEW.PRICE, CHART_VIEW.LINE_PRICE].includes(chartFilter) &&
        (priceData && CHART_VIEW.LINE_PRICE === chartFilter ? (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={priceData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                tickLine={false}
                axisLine={false}
                tickMargin={16}
                minTickGap={120}
                tickFormatter={(tick) => toNiceDate(tick)}
                dataKey="time"
                tick={{ fill: textColor }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                dataKey="open"
                orientation="right"
                tickFormatter={(tick: number) => formatDollarAmount(tick)}
                domain={['auto', 'auto']}
                tick={{ fill: textColor }}
              />
              <Tooltip
                cursor={true}
                formatter={(val: number) => formatDollarAmount(val)}
                labelFormatter={(label) => toNiceDateYear(label)}
                labelStyle={{ paddingTop: 4 }}
                contentStyle={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  borderColor: color,
                  color: 'black',
                }}
                wrapperStyle={{ top: -70, left: -10 }}
              />
              <Area
                key={'other'}
                dataKey={'open'}
                stackId="2"
                strokeWidth={2}
                dot={false}
                type="monotone"
                name={'Price'}
                yAxisId={0}
                stroke={darken(0.12, color)}
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : priceData ? (
          <ResponsiveContainer width="100%" height={height} ref={ref}>
            <CandleStickChart data={priceData} width={width} base={base} />
          </ResponsiveContainer>
        ) : (
          <Flex justifyContent="center">
            <KyberLoading />
          </Flex>
        ))}

      {chartFilter === CHART_VIEW.VOLUME && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart margin={{ top: 0, right: 10, bottom: 6, left: 10 }} barCategoryGap={1} data={chartData}>
            <XAxis
              tickLine={false}
              // axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
              scale="time"
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={(tick) => '$' + toK(tick)}
              tickLine={false}
              orientation="right"
              interval="preserveEnd"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={{ fill: color, opacity: 0.1 }}
              formatter={(val: number) => formatDollarAmount(val)}
              labelFormatter={(label) => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: color,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name={'Volume'}
              dataKey={'volumeUSD'}
              fill={color}
              opacity={'0.4'}
              yAxisId={0}
              stroke={color}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  )
}

export default TokenChart
