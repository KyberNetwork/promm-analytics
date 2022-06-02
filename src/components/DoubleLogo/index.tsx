import React from 'react'
import { NetworkInfo } from 'constants/networks'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  address0?: string
  address1?: string
  activeNetwork: NetworkInfo
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 1;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  // position: absolute;
  // left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
  address0,
  address1,
  size = 16,
  margin = false,
  activeNetwork,
}: DoubleCurrencyLogoProps): React.ReactElement<DoubleCurrencyLogoProps> {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {address0 && <HigherLogo address={address0} size={size.toString() + 'px'} activeNetwork={activeNetwork} />}
      {address1 && (
        <CoveredLogo address={address1} size={size.toString() + 'px'} sizeraw={size} activeNetwork={activeNetwork} />
      )}
    </Wrapper>
  )
}
