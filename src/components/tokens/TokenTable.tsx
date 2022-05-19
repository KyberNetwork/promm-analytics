import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { DarkGreyCard } from 'components/Card'
import { TokenData } from '../../state/tokens/reducer'
import Loader, { LoadingRows } from 'components/Loader'
import { Link } from 'react-router-dom'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { Label, ClickableText } from '../Text'
import { PageButtons, Arrow, Break } from 'components/shared'
import HoverInlineText from '../HoverInlineText'
import useTheme from 'hooks/useTheme'
import { TOKEN_HIDE } from '../../constants/index'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 2fr 85px repeat(4, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1fr 85px repeat(3, 1fr);
    & :nth-child(7) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 20px 1fr 85px repeat(2, 1fr);
    & :nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 670px) {
    grid-template-columns: 1fr 85px 1fr;
    > *:first-child {
      display: none;
    }
    > *:nth-child(6) {
      display: none;
    }
  }
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 20px;
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const ResponsiveLogo = styled(CurrencyLogo)`
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
`

const DataRow = ({ tokenData, index }: { tokenData: TokenData; index: number }) => {
  const activeNetworks = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from tokenData
  const theme = useTheme()
  return (
    <LinkWrapper to={networkPrefix(activeNetworks) + 'token/' + tokenData.address}>
      <ResponsiveGrid>
        <Label>{index + 1}</Label>
        <Label>
          <RowFixed>
            <ResponsiveLogo address={tokenData.address} activeNetwork={activeNetworks} />
            <div style={{ marginLeft: '8px' }}>
              <HoverInlineText color={theme.primary} text={tokenData.name} />
            </div>
          </RowFixed>
        </Label>
        <Label end={1} fontWeight={400}>
          {tokenData.symbol}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(tokenData.tvlUSD)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(tokenData.volumeUSD)}
        </Label>
        <Label end={1} fontWeight={400}>
          {formatDollarAmount(tokenData.priceUSD)}
        </Label>
        <Label end={1} fontWeight={400}>
          <Percent value={tokenData.priceUSDChange} fontWeight={400} />
        </Label>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const SORT_FIELD = {
  name: 'name',
  symbol: 'symbol',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  priceUSD: 'priceUSD',
  priceUSDChange: 'priceUSDChange',
  priceUSDChangeWeek: 'priceUSDChangeWeek',
}

const MAX_ITEMS = 15

export default function TokenTable({
  tokenDatas,
  maxItems = MAX_ITEMS,
}: {
  tokenDatas: TokenData[] | undefined
  maxItems?: number
}): JSX.Element {
  // theming
  const theme = useTheme()
  const activeNetworks = useActiveNetworks()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [activeNetworks])

  useEffect(() => {
    let extraPages = 1
    if (tokenDatas) {
      if (tokenDatas.length % maxItems === 0) {
        extraPages = 0
      }
      const newMaxPage = Math.floor(tokenDatas.length / maxItems) + extraPages
      setMaxPage(newMaxPage)
    }
  }, [maxItems, tokenDatas])

  const sortedTokens = useMemo(() => {
    return tokenDatas
      ? tokenDatas
          .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof TokenData] > b[sortField as keyof TokenData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [tokenDatas, maxItems, page, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  if (!tokenDatas) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedTokens.length > 0 ? (
        <>
          <TableHeader>
            <Label color={theme.subText}>#</Label>
            <ClickableText color={theme.subText} onClick={() => handleSort(SORT_FIELD.name)}>
              Name {arrow(SORT_FIELD.name)}
            </ClickableText>
            <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.symbol)}>
              Symbol {arrow(SORT_FIELD.symbol)}
            </ClickableText>
            <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
              TVL {arrow(SORT_FIELD.tvlUSD)}
            </ClickableText>
            {/* <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.priceUSDChangeWeek)}>
            7d {arrow(SORT_FIELD.priceUSDChangeWeek)}
          </ClickableText> */}
            <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
              Volume 24H {arrow(SORT_FIELD.volumeUSD)}
            </ClickableText>
            <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.priceUSD)}>
              Price {arrow(SORT_FIELD.priceUSD)}
            </ClickableText>
            <ClickableText color={theme.subText} end={1} onClick={() => handleSort(SORT_FIELD.priceUSDChange)}>
              Price Change {arrow(SORT_FIELD.priceUSDChange)}
            </ClickableText>
          </TableHeader>

          <AutoColumn gap="16px" style={{ padding: '20px' }}>
            {sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <React.Fragment key={i}>
                    <DataRow index={(page - 1) * maxItems + i} tokenData={data} />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
            <PageButtons>
              <div
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <Arrow faded={page === 1 ? true : false}>←</Arrow>
              </div>
              <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
              <div
                onClick={() => {
                  setPage(page === maxPage ? page : page + 1)
                }}
              >
                <Arrow faded={page === maxPage ? true : false}>→</Arrow>
              </div>
            </PageButtons>
          </AutoColumn>
        </>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}
