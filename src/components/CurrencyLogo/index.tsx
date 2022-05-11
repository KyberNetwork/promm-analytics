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
  color: ${({ theme }) => theme.text4};
`

type CurrencyLogoType = {
  address?: string
  size?: string
  style?: React.CSSProperties
  activeNetwork: NetworkInfo
}

const TEMP_SOURCE: { [address: string]: string } = {
  ['0x4dd28568d05f09b02220b09c2cb307bfd837cb95']:
    'https://assets.coingecko.com/coins/images/18143/thumb/wCPb0b88_400x400.png?1630667954',
}

const CurrencyLogo: React.FunctionComponent<CurrencyLogoType> = ({
  address,
  size = '24px',
  style,
  activeNetwork,
  ...rest
}: CurrencyLogoType) => {
  const checkSummed = isAddress(address)

  const tokenlist = useCombinedActiveList()?.[activeNetwork.chainId]
  const URI = useMemo(() => {
    if (checkSummed && tokenlist?.[checkSummed]) {
      return tokenlist?.[checkSummed].token.logoURI
    }
    return undefined
  }, [tokenlist, checkSummed])
  const uriLocations = useHttpLocations(URI)

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed && address) {
      return [getTokenLogoURL(checkSummed), ...uriLocations, TEMP_SOURCE[address]]
    }
    return []
  }, [address, uriLocations])

  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}

export default CurrencyLogo
