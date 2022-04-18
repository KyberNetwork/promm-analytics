import { NetworkInfo } from 'constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo): string {
  const prefix = '/' + activeNewtork.route.toLowerCase() + '/'
  return prefix
}
