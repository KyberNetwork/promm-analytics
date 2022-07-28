import React, { useEffect, useState } from 'react'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { useFetchedPositionsDatas } from 'data/wallets/walletData'
import { DarkGreyCard } from 'components/Card'
import { Link } from 'react-router-dom'
import { Label, TableTitle } from 'components/Text'
import useTheme from 'hooks/useTheme'
import { Arrow, Break, PageButtons } from 'components/shared'
import { RowBetween, RowFixed } from 'components/Row'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { TYPE } from 'theme'
import { formatDollarAmount } from 'utils/numbers'
import { useActiveNetworks } from 'state/application/hooks'
import Search from 'components/Search'
import { useMedia } from 'react-use'
import AccountSearch from 'components/AccountSearch'
import { networkPrefix } from 'utils/networkPrefix'
import { LoadingRows } from 'components/Loader'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div<{ isShowNetworkColumn?: boolean }>`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  padding: 0;
  grid-template-columns: 10px 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr;
  grid-template-areas: 'number name ${({ isShowNetworkColumn }) =>
    isShowNetworkColumn ? 'network' : ''} pair pool value';
  > * {
    justify-content: flex-end;
  }

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1.5fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} pair pool value';
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? '75px' : '')} 1fr 1fr;
    grid-template-areas: 'name ${({ isShowNetworkColumn }) => (isShowNetworkColumn ? 'network' : '')} pool value';
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

export default function AccountsOverview(): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const theme = useTheme()

  const { data } = useFetchedPositionsDatas()

  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const below600 = useMedia('(max-width: 600px)')
  const below800 = useMedia('(max-width: 800px)')
  const below1024 = useMedia('(max-width: 1024px)')

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
  const activeNetwork = useActiveNetworks()[0] // todo namgold: get network from tokenData

  return (
    <PageWrapper>
      <AutoColumn gap="lg">
        <RowBetween>
          <Text fontWeight="500" fontSize="24px">
            Wallet Analytics
          </Text>
          {!below600 && <Search />}
        </RowBetween>

        <Flex>
          <AccountSearch shortenAddress={below600} />
        </Flex>

        <Text fontWeight="500" fontSize="18px" mt="2rem">
          Top Positions
        </Text>

        <Wrapper>
          <TableHeader>
            {!below1024 && <TableTitle>#</TableTitle>}
            <TableTitle>ACCOUNT</TableTitle>
            {!below600 && <TableTitle end>PAIR</TableTitle>}
            <TableTitle end>POOL</TableTitle>
            <TableTitle end>VALUE</TableTitle>
          </TableHeader>
          <AutoColumn gap="19.75px" style={{ padding: '20px' }}>
            {data ? (
              data.slice(maxItems * (page - 1), page * maxItems).map((item, index) => (
                <React.Fragment key={item.id}>
                  <ResponsiveGrid>
                    {!below1024 && <Label>{(page - 1) * maxItems + index + 1}</Label>}
                    <LinkWrapper to={'account/' + item.owner}>
                      <Label color={theme.primary}>
                        {below800 ? item.owner.slice(0, 5) + '...' + item.owner.slice(39, 42) : item.owner}
                      </Label>
                    </LinkWrapper>
                    {!below600 && (
                      <Label end={1}>
                        <RowFixed>
                          <DoubleCurrencyLogo
                            address0={item.token0.id}
                            address1={item.token1.id}
                            activeNetwork={activeNetwork}
                          />
                          <Label marginLeft="4px">
                            {item.token0.symbol} - {item.token1.symbol}
                          </Label>
                        </RowFixed>
                      </Label>
                    )}
                    <LinkWrapper to={networkPrefix(activeNetwork) + 'pool/' + item.pool.id}>
                      <Label end={1} color={theme.primary}>
                        {shortenAddress(item.pool.id)}
                      </Label>
                    </LinkWrapper>
                    <Label end={1}>{formatDollarAmount(Number(item.amountDepositedUSD))}</Label>
                  </ResponsiveGrid>
                  <Break />
                </React.Fragment>
              ))
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
            <PageButtons>
              <div
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <Arrow faded={page === 1 ? true : false}>←</Arrow>
              </div>
              <TYPE.body>
                Page {page} of {maxPage}
              </TYPE.body>
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
      </AutoColumn>
    </PageWrapper>
  )
}
