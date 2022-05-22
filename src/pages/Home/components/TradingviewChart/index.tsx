import React, { useState, useEffect, useRef } from 'react'
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import styled from 'styled-components'
import { Play } from 'react-feather'
import useTheme from 'hooks/useTheme'
import { useDarkModeManager } from 'state/user/hooks'
import { formatAmount } from 'utils/numbers'

const IconWrapper = styled.div`
  position: absolute;
  right: 0;
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text1};

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

dayjs.extend(utc)

export enum CHART_TYPES {
  BAR,
  AREA,
}

const Wrapper = styled.div`
  position: relative;
`

// constant height for charts
const HEIGHT = 300

export type TradingViewChartPropsType = {
  type: CHART_TYPES
  data: {
    time: string
    value: number
  }[]
  base: number
  baseChange?: number
  title: string
  width: number
  useWeekly?: boolean
}

const TradingViewChart = ({
  type = CHART_TYPES.BAR,
  data,
  base,
  baseChange,
  title,
  width,
  useWeekly = false,
}: TradingViewChartPropsType): React.ReactElement<TradingViewChartPropsType> => {
  // reference for DOM element to create with chart
  const ref = useRef<HTMLDivElement | null>(null)

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState<IChartApi | false>(false)
  const [darkMode] = useDarkModeManager()
  const theme = useTheme()
  const textColor = darkMode ? 'white' : 'black'

  useEffect(() => {
    if (chartCreated) {
      ref.current && (ref.current.innerHTML = '')
      chartCreated.resize(0, 0)
      setChartCreated(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, baseChange, JSON.stringify(data), type, darkMode])

  // parese the data and format for tardingview consumption
  const formattedData = data?.map((entry) => {
    return {
      time: dayjs(entry.time).utc().format('YYYY-MM-DD'),
      value: entry.value,
    }
  })

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData && ref?.current) {
      const chart = createChart(ref.current, {
        width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0.03,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 1,
            color: darkMode ? '#6C7284' : '#B6B6B6',
            labelVisible: false,
          },
        },
        localization: {
          priceFormatter: (val: number) => formatAmount(val),
        },
      })

      const series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
              color: theme.primary,
              priceFormat: {
                type: 'volume',
              },
              scaleMargins: {
                top: 0.32,
                bottom: 0,
              },
            })
          : chart.addAreaSeries({
              topColor: theme.primary,
              bottomColor: theme.primary + '00',
              lineColor: theme.primary,
              lineWidth: 3,
            })

      series.setData(formattedData)
      const toolTip = document.createElement('div')
      toolTip.className = darkMode ? 'three-line-legend-dark' : 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.fontWeight = '500'
      toolTip.style.left = -4 + 'px'
      toolTip.style.top = '-' + 8 + 'px'
      toolTip.style.backgroundColor = 'transparent'

      // format numbers
      const formattedPercentChange =
        baseChange === undefined ? '--' : (baseChange > 0 ? '+' : '') + baseChange.toFixed(2) + '%'
      const color = baseChange === undefined ? '' : baseChange >= 0 ? 'green' : 'red'

      // get the title of the chart
      const setLastBarText = function () {
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title} ${
            type === CHART_TYPES.BAR && !useWeekly ? '(24H)' : ''
          }</div>` +
          `<div style="font-size: 22px; margin: 4px 0px; color:${textColor}" >` +
          formatAmount(base ?? 0) +
          `<span style="margin-left: 10px; font-size: 16px; color: ${color};">${formattedPercentChange}</span>` +
          '</div>'
      }
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        if (
          param === undefined ||
          param.time === undefined ||
          !param.point ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText()
        } else if ('year' in param.time) {
          const dateStr = useWeekly
            ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .startOf('week')
                .format('MMMM D, YYYY') +
              '-' +
              dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .endOf('week')
                .format('MMMM D, YYYY')
            : dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY')
          const price = param.seriesPrices.get(series)

          toolTip.innerHTML =
            `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title}</div>` +
            `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` +
            formatAmount(price as number) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })

      // chart.timeScale().fitContent()
      if (formattedData.length) {
        chart.timeScale().setVisibleRange({
          from: (new Date(Date.UTC(2022, 0, 1, 0, 0, 0, 0)).getTime() / 1000) as UTCTimestamp,
          to: (new Date(Date.UTC(2050, 0, 1, 0, 0, 0, 0)).getTime() / 1000) as UTCTimestamp,
        })
      }

      setChartCreated(chart)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ref?.current,
    base,
    baseChange,
    chartCreated,
    darkMode,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // JSON.stringify(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(formattedData),
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width,
    theme.primary,
  ])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT)
      chartCreated && chartCreated.timeScale().scrollToPosition(0, true)
    }
  }, [chartCreated, width])

  return (
    <Wrapper>
      <div ref={ref} />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </Wrapper>
  )
}

export default TradingViewChart
