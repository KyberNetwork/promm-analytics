import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import {
  arbitrumBlockClient,
  arbitrumClient,
  blockClient,
  client,
  polygonBlockClient,
  polygonClient,
  rinkebyBlockClient,
  rinkebyClient,
  ropstenBlockClient,
  ropstenClient,
} from 'apollo/client'
import ARBITRUM_LOGO_URL from '../assets/network-logo/arbitrum.svg'
import ETHEREUM_LOGO_URL from '../assets/network-logo/ethereum.png'
import POLYGON_LOGO_URL from '../assets/network-logo/polygon.png'

export enum ChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  POLYGON = 137,
  // MUMBAI = 80001,
  // BSCTESTNET = 97,
  // BSCMAINNET = 56,
  // AVAXTESTNET = 43113,
  // AVAXMAINNET = 43114,
  // FANTOM = 250,
  // CRONOSTESTNET = 338,
  // CRONOS = 25,
  // ARBITRUM_TESTNET = 421611,
  ARBITRUM = 42161,
  // BTTC = 199,
  // VELAS = 106,
  // AURORA = 1313161554,
  // OASIS = 42262,
}

export type NetworkInfo = {
  chainId: ChainId
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  blurb?: string
  client: ApolloClient<NormalizedCacheObject>
  blockClient: ApolloClient<NormalizedCacheObject>
  subgraphName: string
  etherscanUrl: string
  etherscanName: string
  tokenListUrl: string
  nativeToken: {
    symbol: string
    name: string
    address: string
  }
}

const RinkebyNetworkInfo: NetworkInfo = {
  chainId: ChainId.RINKEBY,
  route: 'rinkeby',
  name: 'Rinkeby',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
  client: rinkebyClient,
  blockClient: rinkebyBlockClient,
  subgraphName: 'viet-nv/promm-rinkeby',
  etherscanUrl: 'https://rinkeby.etherscan.io',
  etherscanName: 'Rinkeby Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/rinkeby.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
}

const RopstenNetworkInfo: NetworkInfo = {
  chainId: ChainId.ROPSTEN,
  route: 'ropsten',
  name: 'Ropsten',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
  client: ropstenClient,
  blockClient: ropstenBlockClient,
  subgraphName: 'viet-nv/promm-ropsten',
  etherscanUrl: 'https://ropsten.etherscan.io',
  etherscanName: 'Ropsten Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/ropsten.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
}

const EthereumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ETHEREUM,
  route: 'ethereum',
  name: 'Ethereum',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
  client: client,
  blockClient: blockClient,
  subgraphName: 'uniswap/uniswap-v3',
  etherscanUrl: 'https://etherscan.io',
  etherscanName: 'Etherscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/ethereum.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
}

const ArbitrumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ARBITRUM,
  route: 'arbitrum',
  name: 'Arbitrum',
  bgColor: '#0A294B',
  primaryColor: '#0490ED',
  secondaryColor: '#96BEDC',
  imageURL: ARBITRUM_LOGO_URL,
  blurb: 'Beta',
  client: arbitrumClient,
  blockClient: arbitrumBlockClient,
  subgraphName: 'ianlapham/arbitrum-minimal',
  etherscanUrl: 'https://arbiscan.io',
  etherscanName: 'Arbiscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/arbitrum.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
}

const PolygonNetworkInfo: NetworkInfo = {
  chainId: ChainId.POLYGON,
  route: 'polygon',
  name: 'Polygon',
  bgColor: '#8247e5',
  primaryColor: '#8247e5',
  secondaryColor: '#FB7876',
  imageURL: POLYGON_LOGO_URL,
  blurb: '',
  client: polygonClient,
  blockClient: polygonBlockClient,
  subgraphName: 'ianlapham/uniswap-v3-polygon',
  etherscanUrl: 'https://polygonscan.com',
  etherscanName: 'Polygonscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/matic.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
}

export const ALL_SUPPORT_NETWORKS_ID = Object.values(ChainId).filter((i) => !isNaN(Number(i))) as ChainId[]
export const SHOW_NETWORKS = [ChainId.RINKEBY, ChainId.ROPSTEN]

export const NETWORKS_INFO_LIST: NetworkInfo[] = [
  EthereumNetworkInfo,
  RopstenNetworkInfo,
  RinkebyNetworkInfo,
  ArbitrumNetworkInfo,
  PolygonNetworkInfo,
]

export const NETWORKS_INFO_MAP: { [id in ChainId]: NetworkInfo } = {
  [ChainId.ETHEREUM]: EthereumNetworkInfo,
  [ChainId.ROPSTEN]: RopstenNetworkInfo,
  [ChainId.RINKEBY]: RinkebyNetworkInfo,
  [ChainId.ARBITRUM]: ArbitrumNetworkInfo,
  [ChainId.POLYGON]: PolygonNetworkInfo,
}
