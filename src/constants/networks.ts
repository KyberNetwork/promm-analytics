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

export enum SupportedNetwork {
  RINKEBY,
  ETHEREUM,
  ARBITRUM,
  POLYGON,
}

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
  id: SupportedNetwork
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
  etherscanUrl: string
}

export const RinkebyNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.RINKEBY,
  chainId: ChainId.RINKEBY,
  route: 'rinkeby',
  name: 'Rinkeby',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
  client: rinkebyClient,
  blockClient: rinkebyBlockClient,
  etherscanUrl: 'https://rinkeby.etherscan.io',
}

export const EthereumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.ETHEREUM,
  chainId: ChainId.ETHEREUM,
  route: 'ethereum',
  name: 'Ethereum',
  bgColor: '#fc077d',
  primaryColor: '#fc077d',
  secondaryColor: '#2172E5',
  imageURL: ETHEREUM_LOGO_URL,
  client: client,
  blockClient: blockClient,
  etherscanUrl: 'https://etherscan.io',
}

export const ArbitrumNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.ARBITRUM,
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
  etherscanUrl: 'https://arbiscan.io',
}

export const PolygonNetworkInfo: NetworkInfo = {
  id: SupportedNetwork.POLYGON,
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
  etherscanUrl: 'https://polygonscan.com',
}

export const NETWORKS_INFO: { [id in ChainId]: NetworkInfo } = {
  [ChainId.ETHEREUM]: EthereumNetworkInfo,
  [ChainId.RINKEBY]: RinkebyNetworkInfo,
  [ChainId.ARBITRUM]: ArbitrumNetworkInfo,
  [ChainId.POLYGON]: PolygonNetworkInfo,
}

export const SHOW_NETWORKS = [EthereumNetworkInfo, PolygonNetworkInfo, ArbitrumNetworkInfo]
