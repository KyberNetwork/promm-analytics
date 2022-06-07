import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, BarChart, Bar } from 'recharts'
import { AutoRow, RowBetween, RowFixed } from '../Row'

import { toK, toNiceDate, toNiceDateYear, getTimeframe } from '../../utils'
import { darken } from 'polished'
import { useMedia, usePrevious } from 'react-use'
import { AutoColumn } from '../Column'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import KyberLoading from 'components/Loader/KyberLoading'
import useTheme from 'hooks/useTheme'
import { useDarkModeManager } from 'state/user/hooks'
import { OptionButton } from 'components/Button'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import CandleStickChart from 'components/CandleChart/index2'
import { ApplicationModal } from 'state/application/actions'
import { useHourlyRateData, usePoolChartData, usePoolDatas } from 'state/pools/hooks'
import DensityChart from 'components/PoolChart/DensityChart'
import DropdownSelect from 'components/DropdownSelect'
import { EmptyCard } from 'components'
import { Repeat } from 'react-feather'
import { isMobile } from 'react-device-detect'

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 350px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

enum CHART_VIEW {
  TVL = 'TVL',
  Volume = 'Volume',
  Liquidity = 'Liquidity',
  Fees = 'Fees',
  Price = 'Price',
}

enum PRICE_CHART_VIEW {
  PRICE0 = 'PRICE0',
  PRICE1 = 'PRICE1',
}

type PoolChartProps = {
  address: string
}

const PoolChart = ({ address }: PoolChartProps): JSX.Element => {
  const [view, setView] = useState(CHART_VIEW.TVL)
  const [priceView, setPriceView] = useState(PRICE_CHART_VIEW.PRICE1)

  const [timeWindow, setTimeWindow] = useState(TimeframeOptions.MONTH)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const theme = useTheme()

  // update the width on a window resize
  const ref = useRef<ResponsiveContainer>(null)
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState((ref?.current as any | undefined)?.container?.clientWidth)
  const [height, setHeight] = useState((ref?.current as any | undefined)?.container?.clientHeight)

  const addressPrev = usePrevious(address)
  useEffect(() => {
    if (address !== addressPrev && addressPrev) {
      setView(CHART_VIEW.TVL)
    }
  }, [address, addressPrev])

  useEffect(() => {
    if (!isClient) {
      return
    }
    function handleResize() {
      setWidth((ref?.current as any | undefined)?.container?.clientWidth ?? width)
      setHeight((ref?.current as any | undefined)?.container?.clientHeight ?? height)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height, isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  // get data for pool, and rates
  const poolData = usePoolDatas([address])[0]
  let chartData = usePoolChartData(address)

  const hourlyData = useHourlyRateData(
    address,
    timeWindow,
    timeWindow === TimeframeOptions.FOUR_HOURS
      ? 30
      : timeWindow === TimeframeOptions.ONE_DAY
      ? 120
      : timeWindow === TimeframeOptions.THERE_DAYS
      ? 300
      : 3600
  )
  const hourlyRate0 = hourlyData && hourlyData[0]
  const hourlyRate1 = hourlyData && hourlyData[1]

  // formatted symbols for overflow
  const formattedSymbol0 =
    poolData?.token0?.symbol.length > 6 ? poolData?.token0?.symbol.slice(0, 5) + '...' : poolData?.token0?.symbol
  const formattedSymbol1 =
    poolData?.token1?.symbol.length > 6 ? poolData?.token1?.symbol.slice(0, 5) + '...' : poolData?.token1?.symbol

  const below1080 = useMedia('(max-width: 1080px)')
  const below600 = useMedia('(max-width: 600px)')

  const utcStartTime = getTimeframe(timeWindow)
  chartData = chartData?.filter((entry) => entry.date >= utcStartTime)

  /**
   * Used to format values on chart on scroll
   * Needs to be raw html for chart API to parse styles
   * @param {*} val
   */
  const valueFormatter = useCallback(
    (val: number) => {
      const formattedVal = val < 1 ? formatAmount(val, 10) : formatAmount(val)
      if (priceView === PRICE_CHART_VIEW.PRICE0) {
        return (
          formattedVal +
          `<span style="font-size: 12px; margin-left: 4px;">${formattedSymbol0}/${formattedSymbol1}<span>`
        )
      }
      return (
        formattedVal + `<span style="font-size: 12px; margin-left: 4px;">${formattedSymbol1}/${formattedSymbol0}<span>`
      )
    },
    [priceView, formattedSymbol1, formattedSymbol0]
  )

  const { ONE_DAY, FOUR_HOURS, ALL_TIME, THREE_MONTHS, YEAR, ...timeWindowOptionsExcept1Day } = TimeframeOptions
  const { ALL_TIME: _0, THREE_MONTHS: _1, YEAR: _2, ...timeWindowOptionsExceptAllTime } = TimeframeOptions

  const dataMax = useMemo(() => Math.max(...(chartData?.map((item) => item.volumeUSD) ?? [])), [chartData])
  const dataMin = useMemo(() => Math.min(...(chartData?.map((item) => item.volumeUSD) ?? [])), [chartData])

  const ticks = useMemo(() => {
    if (chartData && chartData.length > 0) {
      const firstTime = chartData[0].date
      const lastTime = chartData[chartData.length - 1].date
      const length = lastTime - firstTime
      let padding = 0.06
      let counts = 6
      if (isMobile) {
        padding = 0.1
        counts = 4
      }
      const positions = []
      for (let i = 0; i < counts; i++) {
        positions.push(padding + (i * (1 - 2 * padding)) / (counts - 1))
      }
      return positions.map((v) => firstTime + length * v)
    }
    return []
  }, [chartData])

  if (chartData && chartData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyCard height="300px">No historical data yet.</EmptyCard>{' '}
      </ChartWrapper>
    )
  }

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={20}>
          <DropdownSelect
            name={ApplicationModal.CHART_VIEW_DROPDOWN}
            options={CHART_VIEW}
            active={view}
            setActive={(value: CHART_VIEW) => {
              setView(value)
            }}
            color={theme.primary}
          />
          {view == CHART_VIEW.Liquidity || (
            <DropdownSelect
              name={ApplicationModal.TIME_DROPDOWN}
              options={view == CHART_VIEW.Price ? timeWindowOptionsExceptAllTime : timeWindowOptionsExcept1Day}
              active={timeWindow}
              setActive={setTimeWindow}
              color={theme.primary}
            />
          )}
        </RowBetween>
      ) : (
        <RowBetween mb={20} align="flex-start">
          <RowFixed style={{ background: theme.buttonBlack, borderRadius: '999px' }}>
            <OptionButton
              active={view === CHART_VIEW.TVL}
              onClick={() => setView(CHART_VIEW.TVL)}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              TVL
            </OptionButton>

            <OptionButton
              active={view === CHART_VIEW.Volume}
              onClick={() => setView(CHART_VIEW.Volume)}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Volume
            </OptionButton>

            <OptionButton
              active={view === CHART_VIEW.Liquidity}
              onClick={() => setView(CHART_VIEW.Liquidity)}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Liquidity
            </OptionButton>
            <OptionButton
              active={view === CHART_VIEW.Fees}
              onClick={() => setView(CHART_VIEW.Fees)}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Fees
            </OptionButton>
            <OptionButton
              active={view == CHART_VIEW.Price}
              onClick={() => setView(CHART_VIEW.Price)}
              style={{ padding: '6px 12px', borderRadius: '999px' }}
            >
              Price
            </OptionButton>
          </RowFixed>
          <AutoColumn justify="flex-end" gap="20px">
            <AutoRow justify="flex-end" align="flex-start" style={{ width: 'fit-content', gap: '6px' }}>
              {view == CHART_VIEW.Price && (
                <>
                  <OptionButton
                    onClick={() =>
                      setPriceView((priceView) =>
                        priceView == PRICE_CHART_VIEW.PRICE1 ? PRICE_CHART_VIEW.PRICE0 : PRICE_CHART_VIEW.PRICE1
                      )
                    }
                  >
                    <Repeat size={12} />
                  </OptionButton>
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
              {![CHART_VIEW.LINE_PRICE, CHART_VIEW.Price].includes(view)
                ? ' '
                : timeWindow === TimeframeOptions.FOUR_HOURS
                ? '30s'
                : timeWindow === TimeframeOptions.ONE_DAY
                ? '2 Mins'
                : timeWindow === TimeframeOptions.THERE_DAYS
                ? '5 Mins'
                : '1 Hr'}
            </Text> */}
          </AutoColumn>
        </RowBetween>
      )}

      {view === CHART_VIEW.TVL && (
        <ResponsiveContainer width="100%" height={355.5}>
          <AreaChart
            margin={{ top: 0, right: 10, bottom: 6, left: 0 }}
            barCategoryGap={1}
            data={chartData}
            height={355.5}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.primary} stopOpacity={0.35} />
                <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              minTickGap={80}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
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
              tickMargin={16}
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
                borderColor: theme.primary,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={' (USD)'}
              dataKey={'totalValueLockedUSD'}
              yAxisId={0}
              stroke={darken(0.12, theme.primary)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {view === CHART_VIEW.Volume && (
        <ResponsiveContainer width="100%" height={355.5}>
          <BarChart
            margin={{ top: 0, right: 0, bottom: 6, left: below1080 ? 0 : 10 }}
            barCategoryGap={1}
            data={chartData}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              ticks={ticks}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={(tick) => '$' + toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              orientation="right"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
              ticks={[
                dataMin,
                dataMin + (1 * (dataMax - dataMin)) / 4,
                dataMin + (2 * (dataMax - dataMin)) / 4,
                dataMin + (3 * (dataMax - dataMin)) / 4,
                dataMin + (4 * (dataMax - dataMin)) / 4,
                dataMin + (5 * (dataMax - dataMin)) / 4,
              ]}
            />
            <Tooltip
              cursor={{ fill: theme.primary, opacity: 0.1 }}
              formatter={(val: number) => formatDollarAmount(val)}
              labelFormatter={(label) => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: theme.primary,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name="Volume"
              dataKey="volumeUSD"
              fill={theme.primary}
              opacity={'0.4'}
              yAxisId={0}
              stroke={theme.primary}
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === CHART_VIEW.Fees && (
        <ResponsiveContainer width="100%" height={355.5}>
          <BarChart
            margin={{ top: 0, right: 0, bottom: 6, left: below1080 ? 0 : 10 }}
            barCategoryGap={1}
            data={chartData}
          >
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              minTickGap={80}
              tickMargin={14}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickMargin={16}
              tickFormatter={(tick) => '$' + toK(tick)}
              tickLine={false}
              interval="preserveEnd"
              orientation="right"
              minTickGap={80}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={{ fill: theme.primary, opacity: 0.1 }}
              formatter={(val: number) => formatDollarAmount(val)}
              labelFormatter={(label) => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: theme.primary,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Bar
              type="monotone"
              name="Fees"
              dataKey="feesUSD"
              fill={theme.primary}
              opacity={'0.4'}
              yAxisId={0}
              stroke={theme.primary}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      {view === CHART_VIEW.Liquidity && <DensityChart address={address} />}

      {view === CHART_VIEW.Price &&
        priceView === PRICE_CHART_VIEW.PRICE0 &&
        (hourlyRate0 ? (
          <ResponsiveContainer ref={ref} width="100%" height={355.5}>
            <CandleStickChart
              data={hourlyRate0}
              base={poolData.token0Price}
              width={width}
              valueFormatter={valueFormatter}
            />
          </ResponsiveContainer>
        ) : (
          <Flex justifyContent="center">
            <KyberLoading />
          </Flex>
        ))}

      {view === CHART_VIEW.Price &&
        priceView === PRICE_CHART_VIEW.PRICE1 &&
        (hourlyRate1 ? (
          <ResponsiveContainer ref={ref} width="100%" height={355.5}>
            <CandleStickChart
              data={hourlyRate1}
              base={poolData.token1Price}
              width={width}
              valueFormatter={valueFormatter}
            />
          </ResponsiveContainer>
        ) : (
          <Flex justifyContent="center">
            <KyberLoading />
          </Flex>
        ))}
    </ChartWrapper>
  )
}

export default PoolChart
