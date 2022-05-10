import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { NetworkInfo } from 'constants/networks'

export const getTokenLogoURL = (address: string): string => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

type CurrencyLogoType = {
  address?: string
  size?: string
  style?: React.CSSProperties
  activeNetwork: NetworkInfo
}

const CurrencyLogo: React.FunctionComponent<CurrencyLogoType> = ({
  address,
  size = '24px',
  style,
  activeNetwork,
  ...rest
}: CurrencyLogoType) => {
  const arbitrumList = useCombinedActiveList()?.[42161]
  const polygon = useCombinedActiveList()?.[137]

  const checkSummed = isAddress(address)

  const arbitrumURI = useMemo(() => {
    if (checkSummed && arbitrumList?.[checkSummed]) {
      return arbitrumList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, arbitrumList])
  const uriLocationsArbitrum = useHttpLocations(arbitrumURI)

  const polygonURI = useMemo(() => {
    if (checkSummed && polygon?.[checkSummed]) {
      return polygon?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, polygon])
  const uriLocationsPOlygon = useHttpLocations(polygonURI)

  //temp until token logo issue merged
  const tempSources: { [address: string]: string } = useMemo(
    () => ({
      ['0x4dd28568d05f09b02220b09c2cb307bfd837cb95']:
        'https://assets.coingecko.com/coins/images/18143/thumb/wCPb0b88_400x400.png?1630667954',
    }),
    []
  )

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed && address) {
      const override = tempSources[address]
      return [getTokenLogoURL(checkSummed), ...uriLocationsArbitrum, ...uriLocationsPOlygon, override]
    }
    return []
  }, [address, tempSources, uriLocationsArbitrum, uriLocationsPOlygon])

  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}

export default CurrencyLogo
