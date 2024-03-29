import { getAddress } from '@ethersproject/address'
import { KYBERSWAP_URL } from 'constants/env'
import { ChainId, NetworkInfo, NETWORKS_INFO_MAP } from 'constants/networks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import dayjs from 'dayjs'
import Numeral from 'numeral'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string | undefined): string | false {
  if (typeof value === 'undefined') return false
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function getEtherscanLink(
  networkInfo: NetworkInfo,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const { etherscanUrl } = networkInfo || NETWORKS_INFO_MAP[ChainId.ETHEREUM]
  switch (type) {
    case 'transaction': {
      return `${etherscanUrl}/tx/${data}`
    }
    case 'token': {
      return `${etherscanUrl}/token/${data}`
    }
    case 'block': {
      return `${etherscanUrl}/block/${data}`
    }
    case 'address':
    default: {
      return `${etherscanUrl}/address/${data}`
    }
  }
}

export const toK = (num: number | string): string => {
  return Numeral(num).format('0.[00]a')
}

export const toNiceDate = (date: number): string => {
  const x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export const toNiceDateYear = (date: number): string => dayjs.utc(dayjs.unix(date)).format('MMMM DD h:mm A, YYYY')

export const currentTimestamp = (): number => new Date().getTime()

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const FEE_BASE_UNITS = 100_000

export function feeTierPercent(fee: number): string {
  return (fee * 100) / FEE_BASE_UNITS + '%'
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export function isAllChain(networkInfos: NetworkInfo[]): boolean {
  return networkInfos.length > 1
}

export function getTimeframe(timeWindow: TimeframeOptions): number {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case TimeframeOptions.ONE_DAY:
      utcStartTime = utcEndTime.subtract(1, 'day').endOf('day').unix() - 1
      break
    case TimeframeOptions.THERE_DAYS:
      utcStartTime = utcEndTime.subtract(3, 'day').endOf('day').unix() - 1
      break
    case TimeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
      break
    case TimeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
      break
    case TimeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
      break
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
      break
  }
  return utcStartTime
}

export function addNetworkIdQueryString(url: string, networkInfo: NetworkInfo): string {
  if (url.includes('?')) {
    const parts = url.split('?')
    return `${parts[0]}/${networkInfo.route}?${parts[1]}`
  }

  return `${url}/${networkInfo.route}`
}

export function generateSwapURL(networkInfo?: NetworkInfo, token0Address = '', token1Address = '') {
  const baseUrl = KYBERSWAP_URL
  if (!networkInfo) {
    return `${baseUrl}/swap`
  }

  const nativeTokenSymbol = networkInfo.nativeToken.symbol
  const wrappedNativeTokenAddress = networkInfo.nativeToken.address
  const chainRoute = networkInfo.route

  const tokenIn =
    token0Address?.toLowerCase() === wrappedNativeTokenAddress.toLowerCase() ? nativeTokenSymbol : token0Address
  const tokenOut =
    token1Address?.toLowerCase() === wrappedNativeTokenAddress.toLowerCase() ? nativeTokenSymbol : token1Address

  if (!token0Address && !token1Address) {
    return `${baseUrl}/swap/${chainRoute}`
  }

  if (!token1Address) {
    return `${baseUrl}/swap/${chainRoute}?inputCurrency=${token0Address}`
  }

  return `${baseUrl}/swap/${chainRoute}?inputCurrency=${tokenIn}&outputCurrency=${tokenOut}`
}

type PoolLinkInfo =
  | {
      type: 'add'
      token0Address: string
      token1Address?: string
      feeTier?: string | number
    }
  | {
      type: 'remove'
      positionId: string | number
    }

export function getPoolLink(info: PoolLinkInfo, networkInfo: NetworkInfo): string {
  const baseUrl = KYBERSWAP_URL
  const chainRoute = networkInfo.route

  if (info.type === 'remove') {
    return `${baseUrl}/${chainRoute}/elastic/remove/${info.positionId}`
  }

  const token0 =
    info.token0Address == networkInfo.nativeToken.address ? networkInfo.nativeToken.symbol : info.token0Address
  const token1 = info.token1Address
    ? info.token1Address === networkInfo.nativeToken.address
      ? networkInfo.nativeToken.symbol
      : info.token1Address
    : undefined

  if (info.feeTier) {
    return `${baseUrl}/${chainRoute}/elastic/add/${token0}/${token1}/${info.feeTier}`
  } else if (info.token1Address) {
    return `${baseUrl}/${chainRoute}/elastic/add/${token0}/${token1}`
  }
  return `${baseUrl}/${chainRoute}/elastic/add/${token0}`
}

export const pushUnique = <T>(array: T[] | undefined, element: T): T[] => {
  const set = new Set<T>(array)
  set.add(element)
  return Array.from(set)
}

export const promiseWithSignal = async (promise: Promise<any>, signal?: AbortSignal): Promise<any> => {
  if (!signal) return promise

  let intervalId: NodeJS.Timeout | null = null
  const result = await Promise.any([
    promise,
    new Promise((_, reject) => {
      intervalId = setInterval(() => {
        if (signal.aborted) {
          reject('Aborted')
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          clearInterval(intervalId!)
        }
      }, 1_000)
    }),
  ])
  if (intervalId) clearInterval(intervalId)
  return result
}
