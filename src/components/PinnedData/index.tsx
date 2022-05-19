import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { Bookmark, ChevronRight, X } from 'react-feather'
import { Text, Flex } from 'rebass'
import useTheme from 'hooks/useTheme'
import { Divider } from 'components/Layout/styled'
import { useSavedAccounts, useSavedPools, useSavedTokens } from 'state/user/hooks'
import { NETWORKS_INFO_LIST } from 'constants/networks'
import { networkPrefix } from 'utils/networkPrefix'
import HoverInlineText from 'components/HoverInlineText'
import { TYPE } from 'theme'

const RightColumn = styled.div<{ open: boolean }>`
  position: sticky;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `}

  :hover {
    cursor: pointer;
  }
`

const SavedButton = styled(RowBetween)`
  padding-bottom: ${({ open }) => open && '20px'};
  padding: 40px 20px 20px;
  border-bottom: ${({ theme, open }) => open && '1px solid ' + theme.border};

  :hover {
    cursor: pointer;
  }
`

const ScrollableDiv = styled.div`
  overflow: auto;
  padding: 20px;
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

type PinnedDataPropType = {
  open: boolean
  setSavedOpen: (value: boolean) => void
}

const PinnedData: React.FunctionComponent<PinnedDataPropType> = ({ open, setSavedOpen }: PinnedDataPropType) => {
  const theme = useTheme()

  const [savedTokens, updateSavedTokens] = useSavedTokens()
  const [savedPools, updateSavedPools] = useSavedPools()
  const [savedAccounts, updateSavedAccounts] = useSavedAccounts()

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
        <Text fontWeight="500">Tokens</Text>
        {NETWORKS_INFO_LIST.map((networkInfo) => {
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
        })}

        <Flex marginTop="20px" />
        <Divider />
        <Text marginTop="20px" fontWeight="500">
          Pools
        </Text>

        {NETWORKS_INFO_LIST.map((networkInfo) => {
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
        })}

        <Flex marginTop="20px" />
        <Divider />
        <Text marginTop="20px" fontWeight="500">
          Accounts
        </Text>

        {NETWORKS_INFO_LIST.map((networkInfo) => {
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
        })}
      </ScrollableDiv>
    </RightColumn>
  )
}

export default PinnedData
