import React, { useMemo, useEffect } from 'react'
import { useMedia } from 'react-use'
import { Text } from 'rebass'

import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import TokenTable from 'components/tokens/TokenTable'
import { useAllTokenData } from 'state/tokens/hooks'
import { notEmpty } from 'utils'
import { RowBetween } from 'components/Row'
import Search from 'components/Search'

export default function TokensOverview(): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])
  const below600 = useMedia('(max-width: 600px)')

  return (
    <PageWrapper>
      <AutoColumn gap="lg">
        {/*<TYPE.main>Your Watchlist</TYPE.main>
        {savedTokens.length > 0 ? (
          <TokenTable tokenDatas={watchListTokens} />
        ) : (
          <DarkGreyCard>
            <TYPE.main>Saved tokens will appear here</TYPE.main>
          </DarkGreyCard>
        )}
        */}
        <RowBetween>
          <Text fontWeight="500" fontSize="24px">
            Top Tokens
          </Text>
          {!below600 && <Search />}
        </RowBetween>
        <TokenTable tokenDatas={formattedTokens} />
      </AutoColumn>
    </PageWrapper>
  )
}
