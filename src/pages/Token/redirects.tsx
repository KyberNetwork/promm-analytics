import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import TokenPage from './TokenPage'
import { isAddress } from 'ethers/lib/utils'

export function RedirectInvalidToken(): JSX.Element {
  const { address } = useParams<{ address: string }>()

  if (!isAddress(address)) {
    return <Redirect to={`/`} />
  }
  return <TokenPage />
}
