import React, { useEffect, useState } from 'react'
import { PageWrapper } from 'pages/styled'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'
import { useFetchedPositionsDatas } from 'data/wallets/walletData'
import { DarkGreyCard } from 'components/Card'
import { Link } from 'react-router-dom'
import { Label } from 'components/Text'
import useTheme from 'hooks/useTheme'
import Loading from 'components/Loader/Loading'
import { Arrow, Break, PageButtons } from 'components/shared'
import { RowBetween, RowFixed } from 'components/Row'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { TYPE } from 'theme'
import { formatDollarAmount } from 'utils/numbers'
import { useActiveNetworks } from 'state/application/hooks'
import Search from 'components/Search'
import { useMedia } from 'react-use'

const StyledInput = styled.input`
  border-radius: 999px;
  flex: 1;
  background: ${({ theme }) => theme.background};
  outline: none;
  color: ${({ theme }) => theme.text};
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-right: 16px;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
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

  grid-template-columns: 20px 3fr repeat(3, 1.2fr);
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

export default function AccountsOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const theme = useTheme()

  const { data } = useFetchedPositionsDatas()

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
  const activeNetwork = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from tokenData
  const below600 = useMedia('(max-width: 600px)')

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
          <StyledInput placeholder="Search wallet/account..."></StyledInput>
          <ButtonPrimary width="fit-content">Analyze</ButtonPrimary>
        </Flex>

        <Text fontWeight="500" fontSize="18px">
          Top Positions
        </Text>

        <Wrapper>
          <TableHeader>
            <Label>#</Label>
            <TableLabel>ACCOUNT</TableLabel>
            <TableLabel end={1}>PAIR</TableLabel>
            <TableLabel end={1}>POOL</TableLabel>
            <TableLabel end={1}>VALUE</TableLabel>
          </TableHeader>
          <AutoColumn gap="16px" style={{ padding: '20px' }}>
            {data ? (
              data.slice(maxItems * (page - 1), page * maxItems).map((item, index) => (
                <React.Fragment key={item.id}>
                  <ResponsiveGrid>
                    <Label>{(page - 1) * maxItems + index + 1}</Label>
                    <LinkWrapper to={'account/' + item.owner}>
                      <Label color={theme.primary}>{item.owner}</Label>
                    </LinkWrapper>
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
                    <LinkWrapper to={'pool/' + item.pool.id}>
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
      </AutoColumn>
    </PageWrapper>
  )
}
