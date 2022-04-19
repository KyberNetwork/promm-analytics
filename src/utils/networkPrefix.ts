import { NetworkInfo } from 'constants/networks'
import { isAllChain } from 'utils'

export function activeNetworkPrefix(activeNewtorks: NetworkInfo[]): string {
  const prefix = isAllChain(activeNewtorks) ? '/' : '/' + activeNewtorks[0].route.toLowerCase() + '/'
  return prefix
}

export function networkPrefix(activeNewtork: NetworkInfo): string {
  const prefix = '/' + activeNewtork.route.toLowerCase() + '/'
  return prefix
}
