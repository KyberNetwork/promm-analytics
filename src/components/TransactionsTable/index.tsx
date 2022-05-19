import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Transaction, TransactionType } from 'types'
import { formatTime } from 'utils/date'
import { ExternalLink, TYPE } from 'theme'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworks } from 'state/application/hooks'
import { ToggleElementFree, ToggleWrapper } from 'components/Toggle'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 1.5fr repeat(5, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`

const TableHeader = styled(ResponsiveGrid)`
  background: ${({ theme }) => theme.tableHeader};
  padding: 18px 20px;
`

const SORT_FIELD = {
  amountUSD: 'amountUSD',
  timestamp: 'timestamp',
  sender: 'sender',
  amountToken0: 'amountToken0',
  amountToken1: 'amountToken1',
}

const DataRow = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  const abs0 = Math.abs(transaction.amountToken0)
  const abs1 = Math.abs(transaction.amountToken1)
  const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const activeNetworks = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from transaction
  const theme = useTheme()

  return (
    <ResponsiveGrid>
      <ExternalLink href={getEtherscanLink(activeNetworks, transaction.hash, 'transaction')}>
        <Label color={color ?? theme.primary} fontWeight={400}>
          {transaction.type === TransactionType.MINT
            ? `Add ${transaction.token0Symbol} and ${transaction.token1Symbol}`
            : transaction.type === TransactionType.SWAP
            ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
            : `Remove ${transaction.token0Symbol} and ${transaction.token1Symbol}`}
        </Label>
      </ExternalLink>
      <Label end={1} fontWeight={400}>
        {formatDollarAmount(transaction.amountUSD)}
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs0)}  ${transaction.token0Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs1)}  ${transaction.token1Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <ExternalLink
          href={getEtherscanLink(activeNetworks, transaction.sender, 'address')}
          style={{ color: color ?? theme.primary }}
        >
          {shortenAddress(transaction.sender)}
        </ExternalLink>
      </Label>
      <Label end={1} fontWeight={400}>
        {formatTime(transaction.timestamp, 0)}
      </Label>
    </ResponsiveGrid>
  )
}

export default function TransactionTable({
  transactions,
  maxItems = 10,
}: {
  transactions: Transaction[]
  maxItems?: number
}): JSX.Element {
  // theming
  const theme = useTheme()
  const activeNetworks = useActiveNetworks()[0] // todo namgold: handle all chain view + get network from transaction

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)
  const filteredTxn = useMemo(
    () => (txFilter === undefined ? transactions : transactions?.filter((x) => x.type === txFilter) || []),
    [transactions, txFilter]
  )

  useEffect(() => {
    let extraPages = 1
    if (filteredTxn.length % maxItems === 0) {
      extraPages = 0
    }
    if (filteredTxn.length === 0) {
      setMaxPage(1)
    } else {
      setMaxPage(Math.floor(filteredTxn.length / maxItems) + extraPages)
    }
  }, [maxItems, filteredTxn, txFilter, page])

  useEffect(() => {
    setPage(1)
  }, [txFilter, activeNetworks])

  const sortedTransactions = useMemo(() => {
    return filteredTxn.length
      ? filteredTxn
          .slice()
          .sort((a, b) => {
            let valueToCompareA = null
            let valueToCompareB = null

            if (a && b) {
              if (sortField === SORT_FIELD.amountToken0 || sortField === SORT_FIELD.amountToken1) {
                valueToCompareA = Math.abs(a[sortField as keyof Transaction] as number)
                valueToCompareB = Math.abs(b[sortField as keyof Transaction] as number)
              } else {
                valueToCompareA = a[sortField as keyof Transaction]
                valueToCompareB = b[sortField as keyof Transaction]
              }
              return valueToCompareA > valueToCompareB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [filteredTxn, maxItems, page, sortField, sortDirection])

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

  return (
    <Wrapper>
      <TableHeader>
        <ToggleWrapper>
          <ToggleElementFree
            fontSize="12px"
            onClick={() => {
              setTxFilter(undefined)
            }}
            isActive={txFilter === undefined}
          >
            All
          </ToggleElementFree>
          <ToggleElementFree
            fontSize="12px"
            onClick={() => {
              setTxFilter(TransactionType.SWAP)
            }}
            isActive={txFilter === TransactionType.SWAP}
          >
            Swaps
          </ToggleElementFree>
          <ToggleElementFree
            fontSize="12px"
            onClick={() => {
              setTxFilter(TransactionType.MINT)
            }}
            isActive={txFilter === TransactionType.MINT}
          >
            Adds
          </ToggleElementFree>
          <ToggleElementFree
            fontSize="12px"
            onClick={() => {
              setTxFilter(TransactionType.BURN)
            }}
            isActive={txFilter === TransactionType.BURN}
          >
            Removes
          </ToggleElementFree>
        </ToggleWrapper>
        <ClickableText color={theme.text2} onClick={() => handleSort(SORT_FIELD.amountUSD)} end={1}>
          Total Value {arrow(SORT_FIELD.amountUSD)}
        </ClickableText>
        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.amountToken0)}>
          Token Amount {arrow(SORT_FIELD.amountToken0)}
        </ClickableText>
        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.amountToken1)}>
          Token Amount {arrow(SORT_FIELD.amountToken1)}
        </ClickableText>
        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.sender)}>
          Account {arrow(SORT_FIELD.sender)}
        </ClickableText>
        <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.timestamp)}>
          Time {arrow(SORT_FIELD.timestamp)}
        </ClickableText>
      </TableHeader>

      <AutoColumn gap="16px" style={{ padding: '20px' }}>
        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRow transaction={t} />
                <Break />
              </React.Fragment>
            )
          }
          return null
        })}
        {sortedTransactions.length === 0 ? <TYPE.main>No Transactions</TYPE.main> : undefined}
        <PageButtons>
          <div
            onClick={() => {
              setPage(page === 1 ? page : page - 1)
            }}
          >
            <Arrow faded={page <= 1 ? true : false}>←</Arrow>
          </div>
          <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
          <div
            onClick={() => {
              setPage(page === maxPage ? page : page + 1)
            }}
          >
            <Arrow faded={page >= maxPage ? true : false}>→</Arrow>
          </div>
        </PageButtons>
      </AutoColumn>
    </Wrapper>
  )
}
