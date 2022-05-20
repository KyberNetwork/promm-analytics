import { getAddress } from '@ethersproject/address'
import { NetworkInfo } from 'constants/networks'
import { TimeframeOptions } from 'data/wallets/positionSnapshotData'
import dayjs from 'dayjs'
import Numeral from 'numeral'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
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
  switch (type) {
    case 'transaction': {
      return `${networkInfo.etherscanUrl}/tx/${data}`
    }
    case 'token': {
      return `${networkInfo.etherscanUrl}/token/${data}`
    }
    case 'block': {
      return `${networkInfo.etherscanUrl}/block/${data}`
    }
    case 'address':
    default: {
      return `${networkInfo.etherscanUrl}/address/${data}`
    }
  }
}

export const toK = (num: number) => {
  return Numeral(num).format('0.[00]a')
}

export const toNiceDate = (date: number) => {
  const x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

export const toNiceDateYear = (date: number) => dayjs.utc(dayjs.unix(date)).format('MMMM DD h:mm A, YYYY')

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

export function feeTierPercent(fee: number): string {
  return (fee / 100).toPrecision(1) + '%'
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export function isAllChain(networkInfos: NetworkInfo[]) {
  return networkInfos.length > 1
}

export function getTimeframe(timeWindow: TimeframeOptions) {
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
    return `${url}&networkId=${networkInfo.chainId}`
  }

  return `${url}?networkId=${networkInfo.chainId}`
}

export function getPoolLink(
  token0Address: string,
  networkInfo: NetworkInfo,
  token1Address?: string,
  remove = false,
  poolAddress?: string
): string {
  const nativeTokenSymbol = networkInfo.nativeToken.symbol

  if (poolAddress) {
    if (!token1Address) {
      return addNetworkIdQueryString(
        process.env.REACT_APP_DMM_SWAP_URL +
          'promm/' +
          (remove ? `remove` : `add`) +
          `/${
            token0Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token0Address
          }/${nativeTokenSymbol}/${poolAddress}`,
        networkInfo
      )
    } else {
      return addNetworkIdQueryString(
        process.env.REACT_APP_DMM_SWAP_URL +
          'promm/' +
          (remove ? `remove` : `add`) +
          `/${token0Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token0Address}/${
            token1Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token1Address
          }/${poolAddress}`,
        networkInfo
      )
    }
  }

  if (!token1Address) {
    return addNetworkIdQueryString(
      process.env.REACT_APP_DMM_SWAP_URL +
        'promm/' +
        (remove ? `remove` : `add`) +
        `/${
          token0Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token0Address
        }/${nativeTokenSymbol}`,
      networkInfo
    )
  } else {
    return addNetworkIdQueryString(
      process.env.REACT_APP_DMM_SWAP_URL +
        'promm/' +
        (remove ? `remove` : `add`) +
        `/${token0Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token0Address}/${
          token1Address === networkInfo.nativeToken.address ? nativeTokenSymbol : token1Address
        }`,
      networkInfo
    )
  }
}
