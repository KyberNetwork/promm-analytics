import { BigNumber } from '@ethersproject/bignumber'
export const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

// temporary! fixing USD accounting on subgraph - open issue if urgent
export const TOKEN_HIDE = ['0xd46ba6d942050d489dbd938a2c909a5d5039a161', '0x7dfb72a2aad08c937706f21421b15bfc34cba9ca']

export const ALL_CHAIN_ID = 'allChain'
