import { NetworkInfo } from 'constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo) {
  const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/'
  return prefix
}
