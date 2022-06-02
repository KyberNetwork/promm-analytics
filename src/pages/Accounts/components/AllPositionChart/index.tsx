import React from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart } from 'recharts'
import { darken } from 'polished'
import { formatDollarAmount } from 'utils/numbers'
import { TimeframeOptions, useAllPoolChartData, useTimeframe } from 'data/wallets/positionSnapshotData'
import useTheme from 'hooks/useTheme'
import { AutoRow, RowBetween } from 'components/Row'
import DropdownSelect from 'components/DropdownSelect'
import { TYPE } from 'theme'
import { OptionButton } from 'components/Button'
import { getTimeframe, toK, toNiceDate, toNiceDateYear } from 'utils'
import { useDarkModeManager } from 'state/user/hooks'
import { Flex } from 'rebass'
import KyberLoading from 'components/Loader/KyberLoading'
import { ApplicationModal } from 'state/application/actions'

const ChartWrapper = styled.div`
  height: 100%;
  max-height: 390px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
    max-height: unset;
  }
`

type AllPoolChartPropsType = {
  account: string
}
const AllPoolChart = ({ account }: AllPoolChartPropsType): JSX.Element => {
  const chartData = useAllPoolChartData(account)

  const [timeWindow, setTimeWindow] = useTimeframe()
  const utcStartTime = getTimeframe(timeWindow)
  const theme = useTheme()

  const below600 = useMedia('(max-width: 600px)')
  const above1600 = useMedia('(min-width: 1600px)')

  // eslint-disable-next-line @typescript-eslint/ban-types
  const domain: [Function, string] = [(dataMin: any) => (dataMin > utcStartTime ? dataMin : utcStartTime), 'dataMax']

  const aspect = above1600 ? 60 / 12 : below600 ? 60 / 42 : 60 / 16

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ONE_DAY, THERE_DAYS, FOUR_HOURS, ...rest } = TimeframeOptions

  return (
    <ChartWrapper>
      {below600 ? (
        <RowBetween mb={40}>
          <div />
          <DropdownSelect
            name={ApplicationModal.TIME_DROPDOWN}
            options={rest}
            active={timeWindow}
            setActive={setTimeWindow}
            color={theme.primary}
          />
        </RowBetween>
      ) : (
        <RowBetween mb={40}>
          <AutoRow gap="10px">
            <TYPE.main>TVL Value</TYPE.main>
          </AutoRow>
          <AutoRow justify="flex-end" gap="4px">
            <OptionButton
              active={timeWindow === TimeframeOptions.MONTH}
              onClick={() => setTimeWindow(TimeframeOptions.MONTH)}
            >
              1M
            </OptionButton>
            <OptionButton
              active={timeWindow === TimeframeOptions.WEEK}
              onClick={() => setTimeWindow(TimeframeOptions.WEEK)}
            >
              1W
            </OptionButton>
            <OptionButton
              active={timeWindow === TimeframeOptions.ALL_TIME}
              onClick={() => setTimeWindow(TimeframeOptions.ALL_TIME)}
            >
              All
            </OptionButton>
          </AutoRow>
        </RowBetween>
      )}
      {chartData ? (
        <ResponsiveContainer
          aspect={aspect}
          // style={{ height: 'inherit' }}
        >
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
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
              tickMargin={16}
              minTickGap={0}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type="number"
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={(tick) => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={6}
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
                borderColor: theme.primary,
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key="other"
              dataKey="valueUSD"
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name="TVL"
              yAxisId={0}
              stroke={darken(0.12, theme.primary)}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Flex justifyContent="center">
          <KyberLoading />
        </Flex>
      )}
    </ChartWrapper>
  )
}

export default AllPoolChart
