import { ChainId, NetworkInfo } from 'constants/networks'
import { WETH_ADDRESSES } from '../constants/index'

export function formatTokenSymbol(address: string, symbol: string, activeNetwork?: NetworkInfo) {
  // dumb catch for matic
  if (address === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' && activeNetwork?.chainId === ChainId.POLYGON) {
    return 'MATIC'
  }

  if (WETH_ADDRESSES.includes(address)) {
    return 'ETH'
  }
  return symbol
}

export function formatTokenName(address: string, name: string, activeNetwork?: NetworkInfo) {
  // dumb catch for matic
  if (address === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' && activeNetwork?.chainId === ChainId.POLYGON) {
    return 'MATIC'
  }

  if (WETH_ADDRESSES.includes(address)) {
    return 'Ether'
  }
  return name
}
