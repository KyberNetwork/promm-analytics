import React, { useState } from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts'
import { formatDollarAmount } from 'utils/numbers'
import { TimeframeOptions, usePoolChartData, useTimeframe } from 'data/wallets/positionSnapshotData'
import useTheme from 'hooks/useTheme'
import { AutoRow, RowBetween } from 'components/Row'
import DropdownSelect from 'components/DropdownSelect'
import { TYPE } from 'theme'
import { OptionButton } from 'components/Button'
import Loader from 'components/Loader'
import { getTimeframe, toK, toNiceDate, toNiceDateYear } from 'utils'
import { useDarkModeManager } from 'state/user/hooks'
import { PositionFields } from 'data/wallets/walletData'

const ChartWrapper = styled.div`
  max-height: 420px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`

const OptionsRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 40px;
`

const CHART_VIEW = {
  VALUE: 'Value',
  FEES: 'Fees',
}

type PoolChartProps = {
  account: string
  activePosition: PositionFields
}

const PoolChart = ({ account, activePosition }: PoolChartProps) => {
  let data = usePoolChartData(account, activePosition.id)

  const [timeWindow, setTimeWindow] = useTimeframe()

  const below600 = useMedia('(max-width: 600px)')

  const [chartView, setChartView] = useState(CHART_VIEW.VALUE)

  // based on window, get starttime
  const utcStartTime = getTimeframe(timeWindow)
  data = data?.filter((entry: any) => entry.date >= utcStartTime) ?? null

  const aspect = below600 ? 60 / 42 : 60 / 16

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'

  const theme = useTheme()
  const color = theme.primary

  const { ONE_DAY, THERE_DAYS, FOUR_HOURS, ...rest } = TimeframeOptions

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <div />
          <DropdownSelect options={rest} active={timeWindow} setActive={setTimeWindow} />
        </RowBetween>
      ) : (
        <OptionsRow>
          <AutoRow>
            <TYPE.main>TVL Value</TYPE.main>
          </AutoRow>
          {/* <AutoRow
            style={{
              minWidth: 'fit-content',
              width: 'fit-content',
              flexWrap: 'nowrap',
              borderRadius: '999px',
              background: theme.buttonBlack,
            }}
          >
            <OptionButton
              active={chartView === CHART_VIEW.VALUE}
              onClick={() => setChartView(CHART_VIEW.VALUE)}
              style={{ borderRadius: '999px', padding: '6px 12px' }}
            >
              TVL
            </OptionButton>
            <OptionButton
              active={chartView === CHART_VIEW.FEES}
              onClick={() => setChartView(CHART_VIEW.FEES)}
              style={{ borderRadius: '999px', padding: '6px 12px' }}
            >
              Fees
            </OptionButton>
          </AutoRow> */}
          <AutoRow justify="flex-end" gap="6px">
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
            <OptionButton
              active={timeWindow === TimeframeOptions.ALL_TIME}
              onClick={() => setTimeWindow(TimeframeOptions.ALL_TIME)}
            >
              All
            </OptionButton>
          </AutoRow>
        </OptionsRow>
      )}
      <ResponsiveContainer aspect={aspect}>
        {data ? (
          <LineChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={1} data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={14}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={(tick) => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={0}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={true}
              formatter={(val: any) => formatDollarAmount(val)}
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

            <Line
              type="monotone"
              dataKey={chartView === CHART_VIEW.VALUE ? 'usdValue' : 'fees'}
              stroke={color}
              yAxisId={0}
              name={chartView === CHART_VIEW.VALUE ? 'TVL' : 'Fees Earned (Cumulative)'}
            />
          </LineChart>
        ) : (
          <Loader />
        )}
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export default PoolChart
