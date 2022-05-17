import { useProtocolData, useProtocolChartData, useProtocolTransactions } from './hooks'
import { useEffect } from 'react'
import { useFetchProtocolData } from 'data/protocol/overview'
import { useFetchGlobalChartData } from 'data/protocol/chart'
import { fetchTopTransactions } from 'data/protocol/transactions'
import { useClients } from 'state/application/hooks'

export default function Updater(): null {
  // client for data fetching
  const { dataClient } = useClients()[0]

  const [protocolData, updateProtocolData] = useProtocolData()
  const { data: fetchedProtocolData, error, loading } = useFetchProtocolData()
  // update overview data if available and not set
  useEffect(() => {
    if (protocolData === undefined && fetchedProtocolData && !loading && !error) {
      updateProtocolData(fetchedProtocolData)
    }
  }, [error, fetchedProtocolData, loading, protocolData, updateProtocolData])

  const [chartData, updateChartData] = useProtocolChartData()
  const { data: fetchedChartData, error: chartError } = useFetchGlobalChartData()
  // update global chart data if available and not set
  useEffect(() => {
    if (chartData === undefined && fetchedChartData && !chartError) {
      updateChartData(fetchedChartData)
    }
  }, [chartData, chartError, fetchedChartData, updateChartData])

  const [transactions, updateTransactions] = useProtocolTransactions()
  useEffect(() => {
    async function fetch() {
      const data = await fetchTopTransactions(dataClient)
      if (data) {
        updateTransactions(data)
      }
    }
    if (!transactions) {
      fetch()
    }
  }, [transactions, updateTransactions, dataClient])

  return null
}
