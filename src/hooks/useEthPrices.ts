import { getBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { getDeltaTimestamps } from 'utils/queries'
import { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { ChainId } from 'constants/networks'
import { useKyberswapConfig } from './useKyberSwapConfig'

export interface EthPrices {
  current: number
  oneDay: number
  twoDay: number
  week: number
}

export const ETH_PRICES = gql`
  query prices($block24: Int!, $block48: Int!, $blockWeek: Int!) {
    current: bundles(first: 1, subgraphError: allow) {
      ethPriceUSD
    }
    oneDay: bundles(first: 1, block: { number: $block24 }, subgraphError: allow) {
      ethPriceUSD
    }
    twoDay: bundles(first: 1, block: { number: $block48 }, subgraphError: allow) {
      ethPriceUSD
    }
    oneWeek: bundles(first: 1, block: { number: $blockWeek }, subgraphError: allow) {
      ethPriceUSD
    }
  }
`

interface PricesResponse {
  current: {
    ethPriceUSD: string
  }[]
  oneDay: {
    ethPriceUSD: string
  }[]
  twoDay: {
    ethPriceUSD: string
  }[]
  oneWeek: {
    ethPriceUSD: string
  }[]
}

async function fetchEthPrices(
  blocks: [number, number, number],
  client: ApolloClient<NormalizedCacheObject>,
  signal: AbortSignal
): Promise<{ data: EthPrices | undefined; error: boolean }> {
  try {
    const { data, error } = await client.query<PricesResponse>({
      query: ETH_PRICES,
      variables: {
        block24: blocks[0] ?? 1,
        block48: blocks[1] ?? 1,
        blockWeek: blocks[2] ?? 1,
      },
      context: {
        fetchOptions: {
          signal,
        },
      },
    })

    if (error) {
      return {
        error: true,
        data: undefined,
      }
    } else if (data) {
      return {
        data: {
          current: parseFloat(data.current[0].ethPriceUSD ?? 0),
          oneDay: parseFloat(data.oneDay[0]?.ethPriceUSD ?? 0),
          twoDay: parseFloat(data.twoDay[0]?.ethPriceUSD ?? 0),
          week: parseFloat(data.oneWeek[0]?.ethPriceUSD ?? 0),
        },
        error: false,
      }
    } else {
      return {
        data: undefined,
        error: true,
      }
    }
  } catch (e) {
    console.log(e)
    return {
      data: undefined,
      error: true,
    }
  }
}

/**
 * returns eth prices at current, 24h, 48h, and 1w intervals
 */
export function useEthPrices(): EthPrices | undefined {
  const [prices, setPrices] = useState<{ [network: string]: EthPrices | undefined }>()
  const [error, setError] = useState(false)
  const { dataClient, blockClient } = useClients()[0]
  const [t24, t48, tWeek] = getDeltaTimestamps()

  // index on active network
  const activeNetwork = useActiveNetworks()[0]
  const indexedPrices = prices?.[activeNetwork.chainId]
  const { isEnableBlockService } = useKyberswapConfig()[activeNetwork.chainId]

  useEffect(() => {
    const abortController = new AbortController()
    async function fetch() {
      const blocks = await getBlocksFromTimestamps(
        isEnableBlockService,
        [t24, t48, tWeek],
        blockClient,
        activeNetwork.chainId,
        abortController.signal
      )
      const formattedBlocks = blocks.map((b) => b.number)

      const { data, error } = await fetchEthPrices(
        formattedBlocks as [number, number, number],
        dataClient,
        abortController.signal
      )
      if (error) {
        setError(true)
      } else if (data) {
        setPrices({
          [activeNetwork.chainId]: data,
        })
      }
    }
    if (!indexedPrices && !error) {
      fetch()
    }
    return () => abortController.abort()
  }, [error, dataClient, indexedPrices, activeNetwork.chainId, isEnableBlockService, t24, t48, tWeek, blockClient])

  return indexedPrices
}

export async function fetchEthPricesV2(
  client: ApolloClient<NormalizedCacheObject>,
  blockClient: ApolloClient<NormalizedCacheObject>,
  isEnableBlockService: boolean,
  chainId: ChainId,
  signal: AbortSignal
): Promise<EthPrices | undefined> {
  try {
    const deltaTimestamps = getDeltaTimestamps()
    const blocks = await getBlocksFromTimestamps(isEnableBlockService, deltaTimestamps, blockClient, chainId, signal)
    const [block24, block48, blockWeek] = blocks ?? []
    const formattedBlocks = [block24, block48, blockWeek].map((b) => b.number)
    const { data } = await fetchEthPrices(formattedBlocks as [number, number, number], client, signal)
    return data
  } catch (error) {
    return
  }
}
