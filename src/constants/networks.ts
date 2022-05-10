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
} from 'apollo/client'
import ARBITRUM_LOGO_URL from '../assets/images/arbitrum.svg'
import ETHEREUM_LOGO_URL from '../assets/images/ethereum-logo.png'
import POLYGON_LOGO_URL from '../assets/images/polygon-logo.png'

export enum ChainId {
  ETHEREUM = 1,
  // ROPSTEN = 3,
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
  etherscanName: 'Etherscan',
  tokenListUrl: '',
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
}

export const ALL_SUPPORT_NETWORKS_ID = Object.values(ChainId).filter((i) => !isNaN(Number(i))) as ChainId[]
export const SHOW_NETWORKS = [ChainId.ETHEREUM, ChainId.POLYGON, ChainId.ARBITRUM]

export const NETWORKS_INFO_LIST: NetworkInfo[] = [
  EthereumNetworkInfo,
  RinkebyNetworkInfo,
  ArbitrumNetworkInfo,
  PolygonNetworkInfo,
]

export const NETWORKS_INFO_MAP: { [id in ChainId]: NetworkInfo } = {
  [ChainId.ETHEREUM]: EthereumNetworkInfo,
  [ChainId.RINKEBY]: RinkebyNetworkInfo,
  [ChainId.ARBITRUM]: ArbitrumNetworkInfo,
  [ChainId.POLYGON]: PolygonNetworkInfo,
}
