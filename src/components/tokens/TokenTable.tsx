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
import { useActiveNetworks, useActiveNetworkUtils } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { useMedia } from 'react-use'
import { NETWORKS_INFO_MAP } from 'constants/networks'

const TOTAL_COLUMN = 7

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div<{ totalColumn: number }>`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 2fr repeat(${({ totalColumn }) => `${totalColumn - 2}`}, 1fr);

  > .network {
    text-align: center;
  }

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(${({ totalColumn }) => `${totalColumn - 3}`}, 1fr);
    > .price-change {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 20px 1fr 85px repeat(${({ totalColumn }) => `${totalColumn - 5}`}, 1fr);
    > .tvl {
      display: none;
    }
  }

  @media screen and (max-width: 670px) {
    grid-template-columns: repeat(4, 1fr);
    > .stt {
      display: none;
    }
    > .tvl {
      display: ${({ totalColumn }) => `${totalColumn === TOTAL_COLUMN ? 'block' : 'none'}`};
    }
    > .symbol {
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
  const below680 = useMedia('(max-width: 680px)')
  const theme = useTheme()
  const { isAllChain } = useActiveNetworkUtils()
  const tokenNetworkInfo = NETWORKS_INFO_MAP[tokenData.chainId]
  const totalColumn = isAllChain ? TOTAL_COLUMN + 1 : TOTAL_COLUMN
  return (
    <LinkWrapper to={networkPrefix(tokenNetworkInfo) + 'token/' + tokenData.address}>
      <ResponsiveGrid totalColumn={totalColumn}>
        <Label className="stt">{index + 1}</Label>
        <Label>
          <RowFixed>
            <ResponsiveLogo address={tokenData.address} activeNetwork={tokenNetworkInfo} />
            <div style={{ marginLeft: '8px' }}>
              <HoverInlineText color={theme.primary} text={below680 ? tokenData.symbol : tokenData.name} />
            </div>
          </RowFixed>
        </Label>
        {isAllChain && (
          <Link to={'/' + tokenNetworkInfo.route} className="network">
            <img src={tokenNetworkInfo.imageURL} width={25} />
          </Link>
        )}
        <Label className="symbol" end={1} fontWeight={400}>
          {tokenData.symbol}
        </Label>
        <Label end={1} fontWeight={400} className="tvl">
          {formatDollarAmount(tokenData.tvlUSD)}
        </Label>
        <Label end={1} fontWeight={400} className="volume">
          {formatDollarAmount(tokenData.volumeUSD)}
        </Label>
        <Label end={1} fontWeight={400} className="price">
          {formatDollarAmount(tokenData.priceUSD)}
        </Label>
        <Label end={1} fontWeight={400} className="price-change">
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
  chain: 'chainId',
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
  const { isAllChain } = useActiveNetworkUtils()

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
  const totalColumn = isAllChain ? TOTAL_COLUMN + 1 : TOTAL_COLUMN
  return (
    <Wrapper>
      {sortedTokens.length > 0 ? (
        <>
          <TableHeader totalColumn={totalColumn}>
            <Label className="stt" color={theme.subText}>
              #
            </Label>
            <ClickableText color={theme.subText} onClick={() => handleSort(SORT_FIELD.name)}>
              Name {arrow(SORT_FIELD.name)}
            </ClickableText>
            {isAllChain && (
              <ClickableText className="network" color={theme.subText} onClick={() => handleSort(SORT_FIELD.chain)}>
                Network {arrow(SORT_FIELD.name)}
              </ClickableText>
            )}
            <ClickableText className="symbol" color={theme.subText} end onClick={() => handleSort(SORT_FIELD.symbol)}>
              Symbol {arrow(SORT_FIELD.symbol)}
            </ClickableText>
            <ClickableText className="tvl" color={theme.subText} end onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
              TVL {arrow(SORT_FIELD.tvlUSD)}
            </ClickableText>
            {/* <ClickableText end onClick={() => handleSort(SORT_FIELD.priceUSDChangeWeek)}>
            7d {arrow(SORT_FIELD.priceUSDChangeWeek)}
          </ClickableText> */}
            <ClickableText color={theme.subText} end onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
              Volume (24H) {arrow(SORT_FIELD.volumeUSD)}
            </ClickableText>
            <ClickableText className="price" color={theme.subText} end onClick={() => handleSort(SORT_FIELD.priceUSD)}>
              Price {arrow(SORT_FIELD.priceUSD)}
            </ClickableText>
            <ClickableText
              className="price-change"
              color={theme.subText}
              end
              onClick={() => handleSort(SORT_FIELD.priceUSDChange)}
            >
              Price Change (24H) {arrow(SORT_FIELD.priceUSDChange)}
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
