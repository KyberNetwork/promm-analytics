import React, { useState, useEffect, useRef } from 'react'
import { createChart, CrosshairMode, IChartApi, UTCTimestamp } from 'lightweight-charts'
import dayjs from 'dayjs'
import { usePrevious } from 'react-use'
import styled from 'styled-components'
import { Play } from 'react-feather'
import useTheme from '../../hooks/useTheme'
import { PriceChartEntry } from 'types'
import { formatDollarAmount } from 'utils/numbers'
import { useDarkModeManager } from 'state/user/hooks'

const IconWrapper = styled.div`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text1};
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

type CandleStickChartPropsType = {
  data: PriceChartEntry[] | undefined
  width?: number
  height?: number
  base: number
  valueFormatter?: (val: number) => string
}

const CandleStickChart = ({
  data,
  width,
  height = 300,
  base,
  valueFormatter = (val: number) => formatDollarAmount(val),
}: CandleStickChartPropsType): JSX.Element => {
  // reference for DOM element to create with chart
  const ref = useRef<HTMLDivElement | null>(null)

  const formattedData = data?.map((entry) => ({
    time: entry.time as UTCTimestamp,
    open: entry.open,
    low: entry.open,
    close: entry.close,
    high: entry.close,
  }))

  if (formattedData && formattedData?.length > 0) {
    formattedData.push({
      time: dayjs().unix() as UTCTimestamp,
      open: formattedData[formattedData.length - 1].close,
      close: base,
      low: Math.min(base, formattedData[formattedData.length - 1].close),
      high: Math.max(base, formattedData[formattedData.length - 1].close),
    })
  }

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState<IChartApi | null>(null)
  const dataPrev = usePrevious(data)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const theme = useTheme()
  const previousTheme = usePrevious(darkMode)

  // reset the chart if theme switches
  useEffect(() => {
    if (chartCreated && previousTheme !== darkMode) {
      // remove the tooltip element
      const tooltip = document.getElementById('tooltip-id')
      const node = ref.current
      tooltip && node?.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated(null)
    }
  }, [chartCreated, darkMode, previousTheme])

  useEffect(() => {
    if (data !== dataPrev && chartCreated) {
      // remove the tooltip element
      const tooltip = document.getElementById('tooltip-id')
      const currentChart = document.getElementsByClassName('tv-lightweight-charts')
      const node = ref.current
      tooltip && node?.removeChild(tooltip)
      if (currentChart.length > 0) {
        node?.removeChild(currentChart[0])
      }
      chartCreated.resize(0, 0)
      setChartCreated(null)
    }
  }, [chartCreated, data, dataPrev])

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && ref.current && formattedData && formattedData?.length > 0) {
      const chart = createChart(ref.current, {
        width: width,
        height: height,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        grid: {
          vertLines: {
            color: darkMode ? '#40505A4d' : '#C2C2C233',
          },
          horzLines: {
            color: darkMode ? '#40505A4d' : '#C2C2C233',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          visible: true,
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        localization: {
          priceFormatter: (val: number) => formatDollarAmount(val),
        },
      })

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#31CB9E',
        downColor: '#FF537B',
        borderDownColor: '#FF537B',
        borderUpColor: '#31CB9E',
        wickDownColor: '#FF537B',
        wickUpColor: '#31CB9E',
      })

      candleSeries.setData(formattedData)

      const toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id')
      toolTip.className = 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.top = '48px'
      toolTip.style.left = '0.75rem'
      toolTip.style.backgroundColor = 'transparent'

      const setLastBarText = () => {
        toolTip.innerHTML = base
          ? `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` + valueFormatter(base) + '</div>'
          : ''
      }

      // get the title of the chart
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        if (
          !width ||
          param === undefined ||
          param.time === undefined ||
          param.point === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          setLastBarText()
        } else {
          const price = (param.seriesPrices.get(candleSeries) as any | undefined)?.close
          const time = dayjs.unix(param.time as number).format('MM/DD h:mm:ss A')
          toolTip.innerHTML =
            `<div style="font-size: 22px; margin: 4px 0px; color: ${theme.text}">` +
            valueFormatter(price) +
            `<span style="font-size: 12px; margin: 4px 6px; color: ${theme.subText}">` +
            time +
            ' UTC' +
            '</span>' +
            '</div>'
        }
      })

      chart.timeScale().fitContent()

      setChartCreated(chart)
    }
  }, [theme.subText, theme.text, chartCreated, formattedData, width, height, valueFormatter, base, textColor, darkMode])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, height)
      chartCreated && chartCreated.timeScale().scrollToPosition(0, true)
    }
  }, [chartCreated, height, width])

  return (
    <>
      <div ref={ref} id="test-id" />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </>
  )
}

export default CandleStickChart
