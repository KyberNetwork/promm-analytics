import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { KS_SETTING_API } from 'constants/env'
import { ChainId, NETWORKS_INFO_MAP } from 'constants/networks'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { createBlockClient } from 'apollo/client'

type KyberswapConfigurationRawResponse =
  | {
      data:
        | {
            config:
              | {
                  blockSubgraph: string | undefined
                  elasticSubgraph: string | undefined
                  isEnableBlockService: boolean | undefined
                }
              | undefined
          }
        | undefined
    }
  | undefined

export type KyberswapConfig = {
  blockClient: ApolloClient<NormalizedCacheObject>
  client: ApolloClient<NormalizedCacheObject>
  isEnableBlockService: boolean
}

export const parseResponse = (
  responseData: KyberswapConfigurationRawResponse,
  defaultChainId: ChainId
): KyberswapConfig => {
  const data = responseData?.data?.config
  const isEnableBlockService = data?.isEnableBlockService ?? false
  const blockClient = createBlockClient(data?.blockSubgraph ?? NETWORKS_INFO_MAP[defaultChainId].defaultBlockSubgraph)
  const client = createBlockClient(data?.elasticSubgraph ?? NETWORKS_INFO_MAP[defaultChainId].defaultSubgraph)

  const result = {
    blockClient,
    client,
    isEnableBlockService,
  }
  return result
}

const ksSettingApi = createApi({
  reducerPath: 'ksSettingConfigurationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${KS_SETTING_API}/v1`,
  }),
  endpoints: (builder) => ({
    getKyberswapConfiguration: builder.query<KyberswapConfig, { chainId: ChainId }>({
      query: ({ chainId }) => ({
        url: '/configurations/fetch',
        params: {
          serviceCode: `kyberswap-${chainId}`,
        },
      }),
      transformResponse: (response: KyberswapConfigurationRawResponse, meta, { chainId }): KyberswapConfig =>
        parseResponse(response, chainId),
    }),
  }),
})

export const { useLazyGetKyberswapConfigurationQuery } = ksSettingApi

export default ksSettingApi
