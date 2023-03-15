import { Pool, Position } from '@kyberswap/ks-sdk-elastic'
import { CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { ChainId } from 'constants/networks'
import { FormattedPosition, PositionFields } from 'data/wallets/walletData'
import JSBI from 'jsbi'

export const calcPosition = ({
  p,
  ethPriceUSD,
  chainId,
}: {
  p: PositionFields
  ethPriceUSD: number | undefined
  chainId: ChainId
}): {
  token0Amount: number
  token1Amount: number
  token0Usd: number
  token1Usd: number
  userPositionUSD: number
} => {
  const token0 = new Token(chainId, p.token0.id, Number(p.token0.decimals), p.token0.symbol)
  const token1 = new Token(chainId, p.token1.id, Number(p.token1.decimals), p.token1.symbol)

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

  const token0Usd = token0Amount * (ethPriceUSD || 0) * parseFloat(p.token0.derivedETH)
  const token1Usd = token1Amount * (ethPriceUSD || 0) * parseFloat(p.token1.derivedETH)

  const userPositionUSD = token0Usd + token1Usd
  return { token0Amount, token1Amount, token0Usd, token1Usd, userPositionUSD }
}

export const formatPositions = (
  positions: PositionFields[] | undefined,
  ethPriceUSD: number | undefined,
  chainId: ChainId
): FormattedPosition[] | undefined => {
  return positions
    ?.map((p) => {
      const position = calcPosition({ p, chainId: chainId, ethPriceUSD: ethPriceUSD })

      return {
        address: p.pool.id,
        valueUSD: position.userPositionUSD,
        token0Amount: position.token0Amount,
        token1Amount: position.token1Amount,
        data: p,
      }
    })
    .sort((a, b) => b.valueUSD - a.valueUSD)
}
