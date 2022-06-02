import React, { useMemo, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAllTokenData } from 'state/tokens/hooks'
import { GreyCard } from 'components/Card'
import { TokenData } from 'state/tokens/reducer'
import { AutoColumn } from 'components/Column'
import { RowFixed, RowFlat } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { TYPE, StyledInternalLink } from 'theme'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworks } from 'state/application/hooks'

const CardWrapper = styled(StyledInternalLink)`
  min-width: 190px;
  margin-right: 16px;

  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const FixedContainer = styled(AutoColumn)``

export const ScrollableRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    display: none;
  }
`

const DataCard = ({ tokenData }: { tokenData: TokenData }) => {
  const activeNetwork = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from tokenData
  return (
    <CardWrapper to={'token/' + tokenData.address}>
      <GreyCard padding="16px">
        <RowFixed>
          <CurrencyLogo address={tokenData.address} size="32px" activeNetwork={activeNetwork} />
          <AutoColumn gap="3px" style={{ marginLeft: '12px' }}>
            <TYPE.label fontSize="14px">
              <HoverInlineText text={tokenData.symbol} />
            </TYPE.label>
            <RowFlat>
              <TYPE.label fontSize="14px" mr="6px" lineHeight="16px">
                {formatDollarAmount(tokenData.priceUSD)}
              </TYPE.label>
              <Percent value={tokenData.priceUSDChange} />
            </RowFlat>
          </AutoColumn>
        </RowFixed>
      </GreyCard>
    </CardWrapper>
  )
}
