import { getAddress } from '@ethersproject/address'
import { SupportedChainId } from 'constants/chains'
import { ArbitrumNetworkInfo, ChainId, NetworkInfo, PolygonNetworkInfo, RinkebyNetworkInfo } from 'constants/networks'

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
