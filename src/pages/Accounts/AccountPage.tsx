import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { shortenAddress, getEtherscanLink } from 'utils'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader from 'components/Loader'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'
import { DarkGreyCard } from 'components/Card'
import TransactionTable from 'components/TransactionsTable'
import { Arrow, Break, PageButtons } from 'components/shared'
import { useActiveNetworks } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { Flex } from 'rebass'
import Loading from 'components/Loader/Loading'
import { useFetchedUserPositionData, useUserTransactions } from 'data/wallets/walletData'
import { Label } from 'components/Text'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { Pool, Position } from '@vutien/dmm-v3-sdk'
import { CurrencyAmount, Token } from '@vutien/sdk-core'
import JSBI from 'jsbi'
import { useEthPrices } from 'hooks/useEthPrices'

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 2.5fr 2fr 2fr 2fr 2fr;
  grid-template-areas: 'pair pool liquidity tokenAmount tokenAmount2 ';
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 18px 20px;
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const TableLabel = styled(Label)`
  color: ${({ theme }) => theme.subText};
  font-weight: 500;
  font-size: 12px;
`

type FormattedPosition = {
  tokenId: string
  address: string
  valueUSD: number
  token0Amount: number
  token1Amount: number
}

export default function AccountPage() {
  let { address } = useParams<{ address: string }>()
  const activeNetwork = useActiveNetworks()[0]

  address = address.toLowerCase()
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const transactions = useUserTransactions(address)

  const { data } = useFetchedUserPositionData(address)
  const ethPriceUSD = useEthPrices()

  const position: { [key: string]: FormattedPosition } = useMemo(() => {
    const positionMap: { [key: string]: FormattedPosition } = {}

    data?.map((p) => {
      const token0 = new Token(activeNetwork.chainId, p.token0.id, Number(p.token0.decimals), p.token0.symbol)
      const token1 = new Token(activeNetwork.chainId, p.token1.id, Number(p.token1.decimals), p.token1.symbol)

      const pool = new Pool(
        token0,
        token1,
        Number(p.pool.feeTier),
        JSBI.BigInt(p.pool.sqrtPrice),
        JSBI.BigInt(p.pool.liquidity),
        JSBI.BigInt(p.pool.reinvestL),
        Number(p.pool.tick)
      )
      const position = new Position({
        pool,
        liquidity: p.liquidity,
        tickLower: Number(p.tickLower.tickIdx),
        tickUpper: Number(p.tickUpper.tickIdx),
      })

      const token0Amount = parseFloat(
        CurrencyAmount.fromRawAmount(position.pool.token0, position.amount0.quotient).toFixed()
      )
      const token1Amount = parseFloat(
        CurrencyAmount.fromRawAmount(position.pool.token1, position.amount1.quotient).toFixed()
      )

      const token0Usd = token0Amount * (ethPriceUSD?.current || 0) * parseFloat(p.token0.derivedETH)
      const token1Usd = token1Amount * (ethPriceUSD?.current || 0) * parseFloat(p.token1.derivedETH)

      const userPositionUSD = token0Usd + token1Usd

      positionMap[p.id] = { tokenId: p.id, address: p.pool.id, valueUSD: userPositionUSD, token0Amount, token1Amount }
    })
    return positionMap
  }, [data, activeNetwork.chainId, ethPriceUSD])

  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const maxItems = 10
  useEffect(() => {
    let extraPages = 1
    if (data) {
      if (data.length % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(data.length / maxItems) + extraPages)
    }
  }, [maxItems, data])

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {data ? (
        <AutoColumn gap="32px">
          <AutoColumn gap="32px">
            <RowBetween>
              <AutoRow gap="4px">
                <StyledInternalLink to={networkPrefix(activeNetwork)}>
                  <TYPE.main>{`Home → `}</TYPE.main>
                </StyledInternalLink>
                <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                  <TYPE.label>{` Accounts `}</TYPE.label>
                </StyledInternalLink>
                <TYPE.main>{` → `}</TYPE.main>
                <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                  <TYPE.link>{shortenAddress(address)}</TYPE.link>
                </StyledExternalLink>
              </AutoRow>
              <RowFixed align="center" justify="center">
                {/* TODO namgold: add search component */}
              </RowFixed>
            </RowBetween>
            <ResponsiveRow align="flex-end">
              <Label>{shortenAddress(address)}</Label>
              <RowFixed>
                {/* <SavedIcon */}
                {/*   fill={!!savedTokens?.[activeNetwork.id]?.[address]} */}
                {/*   onClick={() => addSavedToken(activeNetwork.id, tokenData)} */}
                {/* /> */}
                <StyledExternalLink href={getEtherscanLink(activeNetwork, address, 'address')}>
                  <ButtonPrimary width="fit-content" style={{ height: '38px' }}>
                    View on Explorer
                  </ButtonPrimary>
                </StyledExternalLink>
              </RowFixed>
            </ResponsiveRow>
          </AutoColumn>

          <TYPE.label fontSize="18px">Positions</TYPE.label>
          <Wrapper>
            <TableHeader>
              <TableLabel>PAIR</TableLabel>
              <TableLabel end={1}>POOL</TableLabel>
              <TableLabel end={1}>VALUE</TableLabel>
              <TableLabel end={1}>TOKEN AMOUNT</TableLabel>
              <TableLabel end={1}>TOKEN AMOUNT</TableLabel>
            </TableHeader>
            <AutoColumn gap="16px" style={{ padding: '20px' }}>
              {data ? (
                data.slice(maxItems * (page - 1), page * maxItems).map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ResponsiveGrid>
                      <Label>
                        <RowFixed>
                          <DoubleCurrencyLogo address0={item.token0.id} address1={item.token1.id} />
                          <Label marginLeft="4px">
                            {item.token0.symbol} - {item.token1.symbol}
                          </Label>
                        </RowFixed>
                      </Label>
                      <LinkWrapper to={'pool/' + item.pool.id}>
                        <Label end={1} color={theme.primary}>
                          {shortenAddress(item.pool.id)}
                        </Label>
                      </LinkWrapper>
                      <Label end={1}>{position[item.id].valueUSD}</Label>
                      <Label end={1}>{position[item.id].token0Amount}</Label>
                      <Label end={1}>{position[item.id].token1Amount}</Label>
                    </ResponsiveGrid>
                    <Break />
                  </React.Fragment>
                ))
              ) : (
                <Flex justifyContent="center">
                  <Loading />
                </Flex>
              )}
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
          </Wrapper>

          <TYPE.label fontSize="18px">Transactions</TYPE.label>
          {transactions ? (
            <TransactionTable transactions={transactions.data} />
          ) : (
            <DarkGreyCard>
              <Flex justifyContent="center">
                <Loading size={120} />
              </Flex>
            </DarkGreyCard>
          )}
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}
