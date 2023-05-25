import { PRICE_API } from 'constants/env'
import { useEffect, useState } from 'react'
import { useActiveNetworks } from 'state/application/hooks'

export default function usePrices(addresses: string[]) {
  const activeNetwork = useActiveNetworks()[0]

  const [prices, setPrices] = useState(addresses.map(() => 0))

  const ids = addresses.map((item) => item.toLowerCase()).join(',')

  useEffect(() => {
    const fetchPrices = async () => {
      const res = await fetch(`${PRICE_API}/${activeNetwork.priceRoute}/api/v1/prices`, {
        method: 'POST',
        body: JSON.stringify({
          ids,
        }),
      }).then((res) => res.json())

      if (res?.data?.prices?.length) {
        const formattedPrices = ids.split(',').map((address) => {
          const price = res.data.prices.find((p: any) => p.address.toLowerCase() === address)
          return price.preferPriceSource === 'kyberswap' ? price?.price || 0 : price?.marketPrice || 0
        })

        setPrices(formattedPrices)
      }
    }

    if (ids) fetchPrices()
  }, [ids, activeNetwork.priceRoute])

  return prices
}
