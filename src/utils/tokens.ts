import { NetworkInfo } from 'constants/networks'

export function formatTokenSymbol(address: string, symbol: string, activeNetwork?: NetworkInfo): string {
  if (address.toLowerCase() === activeNetwork?.nativeToken.address.toLowerCase()) {
    return activeNetwork?.nativeToken.symbol
  }

  return symbol
}

export function formatTokenName(address: string, name: string, activeNetwork?: NetworkInfo): string {
  // dumb catch for matic
  if (address.toLowerCase() === activeNetwork?.nativeToken.address.toLowerCase()) {
    return activeNetwork?.nativeToken.name
  }

  return name
}
