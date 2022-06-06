import { BigNumber } from '@ethersproject/bignumber'
export const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

// a list of tokens by chain
// type ChainTokenList = {
//   readonly [chainId: number]: Token[]
// }

export const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

export const WETH_ADDRESSES = [WETH_ADDRESS, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1']

// temporary! fixing USD accounting on subgraph - open issue if urgent
export const TOKEN_HIDE = ['0xd46ba6d942050d489dbd938a2c909a5d5039a161', '0x7dfb72a2aad08c937706f21421b15bfc34cba9ca']
