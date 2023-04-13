import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { ChainId, SUPPORTED_NETWORKS } from 'constants/networks'
import { useLazyGetKyberswapConfigurationQuery, KyberswapConfig, parseResponse } from '../services/ksSetting'
import { AppState } from 'state'

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
          const { data, error } = await getKyberswapConfiguration({ chainId })
          if (data)
            return {
              chainId,
              result: data,
            }
          if (error)
            return {
              chainId,
              result: parseResponse(undefined, chainId),
            }
          return {
            chainId,
            result: parseResponse(undefined, chainId),
          }
        } catch (error) {
          // This wont happended. Just leave here just in case ....
          // If there is API error, it will return data = undefined.
          console.error('🆘🆘🆘🆘🆘🆘🆘🆘 These lines should not be run', { error })
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
