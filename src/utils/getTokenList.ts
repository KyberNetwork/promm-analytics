import { TokenList } from '@uniswap/token-lists'
import uriToHttp from './uriToHttp'

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 */
export default async function getTokenList(listUrl: string): Promise<TokenList> {
  const urls = uriToHttp(listUrl)

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let response
    try {
      response = await fetch(url)
    } catch (error) {
      console.debug('Failed to fetch list', listUrl, error)
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    const json = await response.json()
    return json
  }
  throw new Error('Unrecognized list URL protocol.')
}
