import { getPercentChange } from './../../utils/data'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { getDeltaTimestamps, useDeltaTimestamps } from 'utils/queries'
import { getBlocksFromTimestamps, useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { get2DayChange } from 'utils/data'
import { TokenData } from 'state/tokens/reducer'
import { useEthPrices, EthPrices } from 'hooks/useEthPrices'
import { formatTokenSymbol, formatTokenName } from 'utils/tokens'
import { useActiveNetworks, useClients } from 'state/application/hooks'
import { NetworkInfo } from 'constants/networks'
import { getTopTokenAddresses } from './topTokens'

export const TOKENS_BULK = (block: number | undefined, tokens: string[]): import('graphql').DocumentNode => {
  let tokenString = `[`
  tokens.forEach((address) => {
    tokenString += `"${address.toLowerCase()}",`
  })
  tokenString += ']'
  const queryString =
    `
    query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        symbol
        name
        derivedETH
        volumeUSD
        volume
        txCount
        totalValueLocked
        feesUSD
        totalValueLockedUSD
      }
    }
    `
  return gql(queryString)
}

export interface TokenFields {
  id: string
  symbol: string
  name: string
  derivedETH: string
  volumeUSD: string
  volume: string
  feesUSD: string
  txCount: string
  totalValueLocked: string
  totalValueLockedUSD: string
}

interface TokenDataResponse {
  tokens: TokenFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(
  tokenAddresses: string[]
): {
  loading: boolean
  error: boolean
  data: TokenData[] | undefined
} {
  const activeNetworks = useActiveNetworks()[0]
  const { dataClient } = useClients()[0]

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []
  const ethPrices = useEthPrices()

  const { loading, error, data } = useQuery<TokenDataResponse>(TOKENS_BULK(undefined, tokenAddresses), {
    client: dataClient,
  })

  const { loading: loading24, error: error24, data: data24 } = useQuery<TokenDataResponse>(
    TOKENS_BULK(block24?.number, tokenAddresses),
    {
      client: dataClient,
    }
  )

  const { loading: loading48, error: error48, data: data48 } = useQuery<TokenDataResponse>(
    TOKENS_BULK(block48?.number, tokenAddresses),
    {
      client: dataClient,
    }
  )

  const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<TokenDataResponse>(
    TOKENS_BULK(blockWeek?.number, tokenAddresses),
    {
      client: dataClient,
    }
  )

  const anyError = Boolean(error || error24 || error48 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek || !blocks)

  if (!ethPrices) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.tokens
    ? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.tokens
    ? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48 = data48?.tokens
    ? data48.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.tokens
    ? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = tokenAddresses.reduce((accum: TokenData[], address) => {
    const current: TokenFields | undefined = parsed[address]
    const oneDay: TokenFields | undefined = parsed24[address]
    const twoDay: TokenFields | undefined = parsed48[address]
    const week: TokenFields | undefined = parsedWeek[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]
    const [feesUSD, feesUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.feesUSD, oneDay.feesUSD, twoDay.feesUSD)
        : current
        ? [parseFloat(current.feesUSD), 0]
        : [0, 0]

    const volumeUSDWeek =
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
        ? parseFloat(current.volumeUSD)
        : 0
    const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0
    const tvlUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD)
    const tvlToken = current ? parseFloat(current.totalValueLocked) : 0
    const priceUSD = current ? parseFloat(current.derivedETH) * ethPrices.current : 0
    const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedETH) * ethPrices.oneDay : 0
    const priceUSDWeek = week ? parseFloat(week.derivedETH) * ethPrices.week : 0
    const priceUSDChange =
      priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0

    const priceUSDChangeWeek =
      priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0
    const txCount =
      current && oneDay
        ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
        : current
        ? parseFloat(current.txCount)
        : 0

    accum.push({
      exists: !!current,
      address,
      name: current ? formatTokenName(address, current.name, activeNetworks) : '',
      symbol: current ? formatTokenSymbol(address, current.symbol, activeNetworks) : '',
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      txCount,
      tvlUSD,
      feesUSD,
      feesUSDChange,
      tvlUSDChange,
      tvlToken,
      priceUSD,
      priceUSDChange,
      priceUSDChangeWeek,
      chainId: activeNetworks.chainId,
    })

    return accum
  }, [])

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}

export async function fetchedTokenData(
  network: NetworkInfo,
  ethPrices: EthPrices | undefined
): Promise<TokenData[] | undefined> {
  const [tokenAddresses, blocks] = await Promise.all([
    getTopTokenAddresses(network.client),
    getBlocksFromTimestamps(getDeltaTimestamps(), network.blockClient),
  ])

  const [block24, block48, blockWeek] = blocks ?? []

  // fetch all data
  const inputs = [undefined, block24?.number ?? 0, block48?.number ?? 0, blockWeek?.number ?? 0]
  const response = await Promise.allSettled(
    inputs.map((val) =>
      network.client.query({
        query: TOKENS_BULK(val, tokenAddresses),
        fetchPolicy: 'cache-first',
      })
    )
  )
  const [data, data24, data48, dataWeek] = response.map((e: PromiseSettledResult<any>) =>
    e.status === 'fulfilled' ? e.value.data : ({} as TokenDataResponse)
  )

  if (!ethPrices) {
    return undefined
  }

  const [parsed, parsed24, parsed48, parsedWeek] = [data, data24, data48, dataWeek].map((item) => {
    return item?.tokens
      ? item.tokens.reduce((accum: { [address: string]: TokenFields }, poolData: TokenFields) => {
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}
  })

  // format data and calculate daily changes
  const formatted = tokenAddresses.reduce((accum: TokenData[], address) => {
    const current: TokenFields | undefined = parsed[address]
    const oneDay: TokenFields | undefined = parsed24[address]
    const twoDay: TokenFields | undefined = parsed48[address]
    const week: TokenFields | undefined = parsedWeek[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]
    const [feesUSD, feesUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.feesUSD, oneDay.feesUSD, twoDay.feesUSD)
        : current
        ? [parseFloat(current.feesUSD), 0]
        : [0, 0]

    const volumeUSDWeek =
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
        ? parseFloat(current.volumeUSD)
        : 0
    const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0
    const tvlUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD)
    const tvlToken = current ? parseFloat(current.totalValueLocked) : 0
    const priceUSD = current ? parseFloat(current.derivedETH) * ethPrices.current : 0
    const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedETH) * ethPrices.oneDay : 0
    const priceUSDWeek = week ? parseFloat(week.derivedETH) * ethPrices.week : 0
    const priceUSDChange =
      priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0

    const priceUSDChangeWeek =
      priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0
    const txCount =
      current && oneDay
        ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
        : current
        ? parseFloat(current.txCount)
        : 0

    accum.push({
      exists: !!current,
      address,
      name: current ? formatTokenName(address, current.name, network) : '',
      symbol: current ? formatTokenSymbol(address, current.symbol, network) : '',
      volumeUSD,
      volumeUSDChange,
      volumeUSDWeek,
      txCount,
      tvlUSD,
      feesUSD,
      feesUSDChange,
      tvlUSDChange,
      tvlToken,
      priceUSD,
      priceUSDChange,
      priceUSDChangeWeek,
      chainId: network.chainId,
    })

    return accum
  }, [])

  return formatted
}
