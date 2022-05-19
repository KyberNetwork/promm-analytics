import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { Bookmark, ChevronRight, X } from 'react-feather'
import { Text, Flex } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useSavedAccounts, useSavedPools, useSavedTokens } from 'state/user/hooks'
import { NETWORKS_INFO_LIST } from 'constants/networks'
import { networkPrefix } from 'utils/networkPrefix'
import HoverInlineText from 'components/HoverInlineText'
import { TYPE } from 'theme'

const RightColumn = styled.div<{ open: boolean }>`
  padding: 1.25rem;
  position: sticky;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    display: none;
  `}

  :hover {
    cursor: pointer;
  }
`

const SavedButton = styled(RowBetween)`
  padding-bottom: ${({ open }) => open && '20px'};
  border-bottom: ${({ theme, open }) => open && '1px solid ' + theme.border};
  margin-bottom: ${({ open }) => open && '1.25rem'};

  :hover {
    cursor: pointer;
  }
`

const ScrollableDiv = styled.div`
  overflow: auto;
  padding-bottom: 60px;
  height: calc(100vh - 90px);
`

const TagItem = styled(Link)`
  cursor: pointer;
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.subText + '33'};
  color: ${({ theme }) => theme.subText};
  display: flex;
  gap: 6px;
  align-items: center;
  text-decoration: none;
`

const SavedTitle = styled(Text)`
  font-size: 14px;
  fontweight: 500;
  margin-top: 20px;
`

type PinnedDataPropType = {
  open: boolean
  setSavedOpen: (value: boolean) => void
}

const PinnedData: React.FunctionComponent<PinnedDataPropType> = ({ open, setSavedOpen }: PinnedDataPropType) => {
  const theme = useTheme()

  const [savedTokens, updateSavedTokens] = useSavedTokens()
  const [savedPools, updateSavedPools] = useSavedPools()
  const [savedAccounts, updateSavedAccounts] = useSavedAccounts()

  const accountsList = NETWORKS_INFO_LIST.map((networkInfo) => {
    const id = networkInfo.chainId
    const accounts = Object.keys(savedAccounts[id] || {})
    return accounts.map((account) => (
      <Flex marginTop="16px" key={id + '-' + account} justifyContent="space-between" alignItems="center">
        <TagItem role="button" to={networkPrefix(networkInfo) + `account/${account}`}>
          <img src={networkInfo.imageURL} width="16px" height="16px" alt="" />
          {account?.slice(0, 6) + '...' + account?.slice(38, 42)}
        </TagItem>
        <X color={theme.subText} role="button" onClick={() => updateSavedAccounts(id, account)} size={24} />
      </Flex>
    ))
  }).filter((item) => item.length)

  const pairsList = NETWORKS_INFO_LIST.map((networkInfo) => {
    const id = networkInfo.chainId
    const pools = Object.values(savedPools[id] || {})
    return pools.map((pool) => (
      <Flex marginTop="16px" key={id + '-' + pool.address} justifyContent="space-between" alignItems="center">
        <TagItem role="button" to={networkPrefix(networkInfo) + `pool/${pool.address}`}>
          <img src={networkInfo.imageURL} width="16px" height="16px" alt="" />
          <HoverInlineText
            maxCharacters={18}
            text={`${pool.token0.symbol}/${pool.token1.symbol} (${pool.feeTier / 100}%)`}
          />
        </TagItem>
        <X color={theme.subText} role="button" onClick={() => updateSavedPools(id, pool)} size={24} />
      </Flex>
    ))
  }).filter((item) => item.length)

  const tokensList = NETWORKS_INFO_LIST.map((networkInfo) => {
    const id = networkInfo.chainId
    const tokens = Object.values(savedTokens[id] || {})
    return tokens.map((token) => (
      <Flex marginTop="16px" key={id + '-' + token.address} justifyContent="space-between" alignItems="center">
        <TagItem role="button" to={networkPrefix(networkInfo) + `token/${token.address}`}>
          <img src={networkInfo.imageURL} width="16px" height="16px" alt="" />
          {token.symbol}
        </TagItem>
        <X color={theme.subText} role="button" onClick={() => updateSavedTokens(id, token)} size={24} />
      </Flex>
    ))
  }).filter((item) => item.length)

  return !open ? (
    <RightColumn open={open} onClick={() => setSavedOpen(true)}>
      <SavedButton open={open}>
        <Bookmark size={20} color={theme.subText} />
      </SavedButton>
    </RightColumn>
  ) : (
    <RightColumn open={open}>
      <SavedButton onClick={() => setSavedOpen(false)} open={open}>
        <Flex alignItems="center">
          <Bookmark size={16} color={theme.subText} />
          <TYPE.main ml="4px">Saved</TYPE.main>
        </Flex>
        <ChevronRight color={theme.subText} size={24} />
      </SavedButton>

      <ScrollableDiv>
        <SavedTitle>Saved Accounts</SavedTitle>

        {accountsList.length ? accountsList : <TYPE.light>Pinned accounts will appear here.</TYPE.light>}

        <Flex marginTop="20px" />

        <SavedTitle>Saved Pools</SavedTitle>

        {pairsList.length ? pairsList : <TYPE.light>Pinned pairs will appear here.</TYPE.light>}

        <Flex marginTop="20px" />

        <SavedTitle>Saved Tokens</SavedTitle>
        {tokensList.length ? tokensList : <TYPE.light>Pinned tokens will appear here.</TYPE.light>}
      </ScrollableDiv>
    </RightColumn>
  )
}

export default PinnedData
