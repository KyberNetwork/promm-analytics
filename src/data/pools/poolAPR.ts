import { NetworkInfo } from 'constants/networks'

export async function fetchPoolsAPR(networkInfo: NetworkInfo): Promise<{ [address: string]: number | undefined }> {
  const result: { [address: string]: number | undefined } = {}
  for (let i = 1; i < 100; i++) {
    try {
      const callResult = await fetch(
        `${process.env.REACT_APP_POOL_SERVICE}/${networkInfo.poolRoute}/api/v1/elastic/pools?page=${i}&perPage=1000`
      ).then((response) => response.json())

      if (!callResult?.data?.pools.length) throw ''
      callResult.data.pools.forEach(({ id, apr }: { id: string; apr: string }) => {
        result[id] = parseFloat(apr)
        result[id.toLowerCase()] = parseFloat(apr)
      })
    } catch {
      break
    }
  }
  return result
}
