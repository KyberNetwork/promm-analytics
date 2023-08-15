import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Pagination from 'components/Pagination'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Transaction, TransactionType } from 'types'
import { formatTime } from 'utils/date'
import { ExternalLink, TYPE } from 'theme'
import { Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworkUtils } from 'state/application/hooks'
import { ToggleElementFree, ToggleWrapper } from 'components/Toggle'
import { Link } from 'react-router-dom'
import { NETWORKS_INFO_MAP } from 'constants/networks'
import { useMedia } from 'react-use'
import usePrices from 'hooks/useTokensPrice'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  overflow: hidden;
  padding: 0;
`

const ResponsiveGrid = styled.div<{ isAllChain: boolean }>`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 2fr repeat(${({ isAllChain }) => `${isAllChain ? 6 : 5}`}, 1fr);
  > .network {
    text-align: center;
  }

  ${({ theme, isAllChain }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(${isAllChain ? 6 : 5}, 1fr);
    > .total{
      display: none;
    }
  `}

  ${({ theme, isAllChain }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1.5fr repeat(${isAllChain ? 2 : 1}, 1fr);
    > .amount1 {
      display: none;
    }
    > .amount2{
      display: none;
    }
    > .account{
      display: none;
    }
  `}
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
  chainId: 'chainId',
}

const Select = styled.select`
  background: ${({ theme }) => theme.buttonBlack};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 10px;
  color: ${({ theme }) => theme.text};
  outline: none;
  width: fit-content;
`

const DataRow = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  const abs0 = Math.abs(transaction.amountToken0)
  const abs1 = Math.abs(transaction.amountToken1)
  const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const { isAllChain } = useActiveNetworkUtils()
  const theme = useTheme()
  const networkInfo = NETWORKS_INFO_MAP[transaction.chainId]

  return (
    <ResponsiveGrid isAllChain={isAllChain}>
      <ExternalLink href={getEtherscanLink(networkInfo, transaction.hash, 'transaction')}>
        <Label color={color ?? theme.primary} fontWeight={400}>
          {transaction.type === TransactionType.MINT
            ? `Add ${transaction.token0Symbol} and ${transaction.token1Symbol}`
            : transaction.type === TransactionType.SWAP
            ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
            : `Remove ${transaction.token0Symbol} and ${transaction.token1Symbol}`}
        </Label>
      </ExternalLink>
      {isAllChain && (
        <Link to={'/' + networkInfo.route} className="network">
          <img src={networkInfo.imageURL} width={25} />
        </Link>
      )}
      <Label className="total" end={1} fontWeight={400}>
        {formatDollarAmount(transaction.amountUSD)}
      </Label>
      <Label className="amount1" end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs0)}  ${transaction.token0Symbol}`} maxCharacters={16} />
      </Label>
      <Label className="amount2" end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs1)}  ${transaction.token1Symbol}`} maxCharacters={16} />
      </Label>
      <Label className="account" end={1} fontWeight={400}>
        <ExternalLink
          href={getEtherscanLink(networkInfo, transaction.sender, 'address')}
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
const ListTabs = [
  { value: TransactionType.ALL, label: 'All' },
  { value: TransactionType.SWAP, label: 'Swaps' },
  { value: TransactionType.MINT, label: 'Adds' },
  { value: TransactionType.BURN, label: 'Removes' },
]
export default function TransactionTable({
  transactions,
  maxItems = 10,
}: {
  transactions: Transaction[]
  maxItems?: number
}): JSX.Element {
  // theming
  const theme = useTheme()
  const { isAllChain, chainId } = useActiveNetworkUtils()

  const tokens = Object.keys(
    transactions.reduce((acc, cur) => {
      acc[cur.token0Address] = 1
      acc[cur.token1Address] = 1
      return acc
    }, {} as { [key: string]: 1 })
  )

  const prices = usePrices(tokens)

  const priceMap = tokens.reduce((acc, cur, index) => {
    acc[cur] = prices[index]
    return acc
  }, {} as { [key: string]: number })

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | string>(TransactionType.ALL)

  const filteredTxn = useMemo(() => {
    const txFilterStr = txFilter.toString()
    return txFilterStr === TransactionType.ALL.toString()
      ? transactions
      : transactions?.filter((x) => x.type.toString() === txFilterStr) || []
  }, [transactions, txFilter])

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
  }, [txFilter, chainId])

  const sortedTransactions = useMemo(() => {
    return filteredTxn.length
      ? filteredTxn
          .slice()
          .map((item) => {
            const cloneItem = { ...item }
            const isSwapTx = item.amountToken0 * item.amountToken1 < 0

            if (priceMap[item.token0Address] && priceMap[item.token1Address]) {
              cloneItem.amountUSD =
                priceMap[item.token0Address] * Math.abs(item.amountToken0) +
                priceMap[item.token1Address] * Math.abs(item.amountToken1)
            }
            if (isSwapTx) cloneItem.amountUSD /= 2
            return cloneItem
          })
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
      setPage(1)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )
  const below960 = useMedia('(max-width: 960px)')

  return (
    <Wrapper>
      <TableHeader isAllChain={isAllChain}>
        {below960 ? (
          <Select onChange={(e) => setTxFilter(e.target.value)}>
            {ListTabs.map((item) => (
              <option value={item.value} key={item.label}>
                {item.label}
              </option>
            ))}
          </Select>
        ) : (
          <ToggleWrapper>
            {ListTabs.map((item) => (
              <ToggleElementFree
                key={item.label}
                fontSize="12px"
                onClick={() => {
                  setTxFilter(item.value)
                }}
                isActive={txFilter === item.value}
              >
                {item.label}
              </ToggleElementFree>
            ))}
          </ToggleWrapper>
        )}

        {isAllChain && (
          <ClickableText textAlign="center" color={theme.text2} onClick={() => handleSort(SORT_FIELD.chainId)}>
            Network {arrow(SORT_FIELD.chainId)}
          </ClickableText>
        )}
        <ClickableText className="total" color={theme.text2} onClick={() => handleSort(SORT_FIELD.amountUSD)} end>
          Total Value {arrow(SORT_FIELD.amountUSD)}
        </ClickableText>
        <ClickableText className="amount1" color={theme.text2} end onClick={() => handleSort(SORT_FIELD.amountToken0)}>
          Token Amount {arrow(SORT_FIELD.amountToken0)}
        </ClickableText>
        <ClickableText className="amount2" color={theme.text2} end onClick={() => handleSort(SORT_FIELD.amountToken1)}>
          Token Amount {arrow(SORT_FIELD.amountToken1)}
        </ClickableText>
        <ClickableText className="account" color={theme.text2} end onClick={() => handleSort(SORT_FIELD.sender)}>
          Account {arrow(SORT_FIELD.sender)}
        </ClickableText>
        <ClickableText color={theme.text2} end onClick={() => handleSort(SORT_FIELD.timestamp)}>
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
        <Pagination setPage={setPage} page={page} maxPage={maxPage} />
      </AutoColumn>
    </Wrapper>
  )
}
