import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { createBlockClient, createClient } from 'apollo/client'
import { NETWORKS_INFO_MAP, ChainId, SUPPORTED_NETWORKS } from 'constants/networks'
import { KyberswapConfigurationResponse, useLazyGetKyberswapConfigurationQuery } from '../services/ksSetting'
import { AppState } from 'state'

type KyberswapConfig = {
  blockClient: ApolloClient<NormalizedCacheObject>
  client: ApolloClient<NormalizedCacheObject>
}

const cacheConfig: {
  blockClient: { [subgraphLink: string]: ApolloClient<NormalizedCacheObject> }
  client: { [subgraphLink: string]: ApolloClient<NormalizedCacheObject> }
} = {
  blockClient: {},
  client: {},
}

const cacheCalc: <T extends keyof typeof cacheConfig, U extends typeof cacheConfig[T][string]>(
  type: T,
  value: string,
  fallback: (value: string) => U
) => U = <T extends keyof typeof cacheConfig, U extends typeof cacheConfig[T][string]>(
  type: T,
  value: string,
  fallback: (value: string) => U
) => {
  if (!cacheConfig[type][value]) {
    cacheConfig[type][value] = fallback(value)
  }
  return cacheConfig[type][value] as U
}

const parseResponse = (
  responseData: KyberswapConfigurationResponse | undefined,
  defaultChainId: ChainId
): KyberswapConfig => {
  const data = responseData?.data?.config

  const blockClient = cacheCalc(
    'blockClient',
    responseData?.data?.config?.blockSubgraph ?? NETWORKS_INFO_MAP[defaultChainId].defaultBlockSubgraph,
    (subgraph) => createBlockClient(subgraph)
  )
  const client = cacheCalc(
    'client',
    responseData?.data?.config?.elasticSubgraph ?? NETWORKS_INFO_MAP[defaultChainId].defaultSubgraph,
    (subgraph) => createClient(subgraph)
  )

  return {
    blockClient,
    client,
  }
}

export const useKyberswapConfig = (): {
  [chain in ChainId]: KyberswapConfig
} => {
  const storeChainIds = useSelector<AppState, ChainId[]>((state) => state.application.activeNetworksId) // read directly from store instead of useActiveWeb3React to prevent circular loop
  const [kyberswapConfigs, setKyberswapConfigs] = useState<
    | {
        [chain in ChainId]: KyberswapConfig
      }
    | null
  >(null)
  const [getKyberswapConfiguration] = useLazyGetKyberswapConfigurationQuery()

  useEffect(() => {
    const run = async () => {
      setKyberswapConfigs(null)
      const fetches = storeChainIds.map(async (chainId) => {
        try {
          const { data } = await getKyberswapConfiguration({ chainId })
          return {
            chainId,
            result: parseResponse(data, chainId),
          }
        } catch {
          return {
            chainId,
            result: parseResponse(undefined, chainId),
          }
        }
      })
      const results = await Promise.all(fetches)

      const resultWithDefaultConfigs = SUPPORTED_NETWORKS.reduce(
        (acc, cur) => {
          acc[cur] = parseResponse(undefined, cur)
          return acc
        },
        {} as {
          [chainId in ChainId]: KyberswapConfig
        }
      )
      results.forEach((chainResult) => {
        resultWithDefaultConfigs[chainResult.chainId] = chainResult.result
      })
      setKyberswapConfigs(resultWithDefaultConfigs)
    }
    run()
  }, [storeChainIds, getKyberswapConfiguration])

  const defaultConfig = useMemo(
    () =>
      SUPPORTED_NETWORKS.reduce(
        (acc, cur) => {
          acc[cur] = parseResponse(undefined, cur)
          return acc
        },
        {} as {
          [chainId in ChainId]: KyberswapConfig
        }
      ),
    []
  )

  return kyberswapConfigs ?? defaultConfig
}
