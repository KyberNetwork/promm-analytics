import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { KS_SETTING_API } from 'constants/env'
import { ChainId } from 'constants/networks'

export type KyberswapConfigurationResponse = {
  data: {
    config: {
      blockSubgraph: string
      elasticSubgraph: string
    }
  }
}

export type KyberswapGlobalConfigurationResponse = {
  data: {
    config: {
      aggregator: string
    }
  }
}

const ksSettingApi = createApi({
  reducerPath: 'ksSettingConfigurationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${KS_SETTING_API}/v1`,
  }),
  endpoints: (builder) => ({
    getKyberswapConfiguration: builder.query<KyberswapConfigurationResponse, { chainId: ChainId }>({
      query: ({ chainId }) => ({
        url: '/configurations/fetch',
        params: {
          serviceCode: `kyberswap-${chainId}`,
        },
      }),
    }),
  }),
})

export const { useLazyGetKyberswapConfigurationQuery } = ksSettingApi

export default ksSettingApi
