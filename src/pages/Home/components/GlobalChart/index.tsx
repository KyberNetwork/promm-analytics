import React from 'react'
import TVLChart from './TVLChart'
import VolumeChart from './VolumeChart'

export enum CHART_VIEW {
  VOLUME,
  TVL,
}

type GlobalChartPropsType = {
  chartView: CHART_VIEW
}
const GlobalChart = ({ chartView }: GlobalChartPropsType): React.ReactElement<GlobalChartPropsType> | null => {
  if (chartView === CHART_VIEW.TVL) return <TVLChart />
  if (chartView === CHART_VIEW.VOLUME) return <VolumeChart />
  return null
}

export default GlobalChart
