import { ApolloClient } from '@apollo/client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { createBlockClient, createClient } from 'apollo/client'

import ARBITRUM_LOGO_URL from '../assets/network-logo/arbitrum.svg'
import AURORA_LOGO_URL from '../assets/network-logo/aurora.svg'
import AVAX_LOGO_URL from '../assets/network-logo/avax.png'
import BTTC_LOGO_URL from '../assets/network-logo/bittorrent.png'
import BNB_LOGO_URL from '../assets/network-logo/bnb.png'
import CRONOS_LOGO_URL from '../assets/network-logo/cronos.png'
import ETHEREUM_LOGO_URL from '../assets/network-logo/ethereum.png'
import FANTOM_LOGO_URL from '../assets/network-logo/fantom.png'
import OASIS_LOGO_URL from '../assets/network-logo/oasis.svg'
import POLYGON_LOGO_URL from '../assets/network-logo/polygon.png'
import VELAS_LOGO_URL from '../assets/network-logo/velas.png'
import OPTIMISM_LOGO_URL from '../assets/network-logo/optimism.svg'
import { ALL_CHAIN_ID } from 'constants/index'

export enum ChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  POLYGON = 137,
  // MUMBAI = 80001,
  // BSCTESTNET = 97,
  BSCMAINNET = 56,
  // AVAXTESTNET = 43113,
  AVAXMAINNET = 43114,
  FANTOM = 250,
  // CRONOSTESTNET = 338,
  CRONOS = 25,
  // ARBITRUM_TESTNET = 421611,
  ARBITRUM = 42161,
  BTTC = 199,
  VELAS = 106,
  AURORA = 1313161554,
  OASIS = 42262,
  OPTIMISM = 10,
}

export type ChainIdType = ChainId | typeof ALL_CHAIN_ID

export type NetworkInfo = {
  chainId: ChainId
  route: string
  poolRoute: string
  name: string
  imageURL: string
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
  startBlock: number
}

const RinkebyNetworkInfo: NetworkInfo = {
  chainId: ChainId.RINKEBY,
  route: 'rinkeby',
  poolRoute: 'ethereum',
  name: 'Rinkeby',
  imageURL: ETHEREUM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/viet-nv/promm-rinkeby'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/billjhlee/rinkeby-blocks'),
  subgraphName: 'viet-nv/promm-rinkeby',
  etherscanUrl: 'https://rinkeby.etherscan.io',
  etherscanName: 'Rinkeby Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/rinkeby.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
  startBlock: 10781862,
}

const RopstenNetworkInfo: NetworkInfo = {
  chainId: ChainId.ROPSTEN,
  route: 'ropsten',
  poolRoute: 'ethereum',
  name: 'Ropsten',
  imageURL: ETHEREUM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/viet-nv/promm-ropsten'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/edwardevans094/ropsten-blocks'),
  subgraphName: 'viet-nv/promm-ropsten',
  etherscanUrl: 'https://ropsten.etherscan.io',
  etherscanName: 'Ropsten Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/ropsten.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
  startBlock: 12319943,
}

const EthereumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ETHEREUM,
  route: 'ethereum',
  poolRoute: 'ethereum',
  name: 'Ethereum',
  imageURL: ETHEREUM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-mainnet'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-ethereum'),
  subgraphName: 'kybernetwork/kyberswap-elastic-mainnet',
  etherscanUrl: 'https://etherscan.io',
  etherscanName: 'Etherscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/ethereum.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  startBlock: 14932476,
}

const BscNetworkInfo: NetworkInfo = {
  chainId: ChainId.BSCMAINNET,
  route: 'bnb',
  poolRoute: 'bsc',
  name: 'BNB Chain',
  imageURL: BNB_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-bsc'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-bsc'),
  subgraphName: 'kybernetwork/kyberswap-elastic-bsc',
  etherscanUrl: 'https://bscscan.com',
  etherscanName: 'BscScan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/bsc.mainnet.tokenlist.json',
  nativeToken: {
    symbol: 'BNB',
    name: 'BNB (Wrapped)',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  },
  startBlock: 18532980,
}

const ArbitrumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ARBITRUM,
  route: 'arbitrum',
  poolRoute: 'arbitrum',
  name: 'Arbitrum',
  imageURL: ARBITRUM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-arbitrum-one'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/kybernetwork/arbitrum-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-arbitrum-one',
  etherscanUrl: 'https://arbiscan.io',
  etherscanName: 'Arbiscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/arbitrum.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  startBlock: 14137735,
}

const PolygonNetworkInfo: NetworkInfo = {
  chainId: ChainId.POLYGON,
  route: 'polygon',
  poolRoute: 'polygon',
  name: 'Polygon',
  imageURL: POLYGON_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-matic'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-polygon'),
  subgraphName: 'kybernetwork/kyberswap-elastic-matic',
  etherscanUrl: 'https://polygonscan.com',
  etherscanName: 'Polygonscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/matic.tokenlist.json',
  nativeToken: {
    symbol: 'MATIC',
    name: 'MATIC (Wrapped)',
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  startBlock: 29347468,
}

const AvaxNetworkInfo: NetworkInfo = {
  chainId: ChainId.AVAXMAINNET,
  route: 'avalanche',
  poolRoute: 'avalanche',
  name: 'Avalanche',
  imageURL: AVAX_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-avalanche'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/ducquangkstn/avalache-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-avalanche',
  etherscanUrl: 'https://snowtrace.io',
  etherscanName: 'Snowtrace',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/avax.mainnet.tokenlist.json',
  nativeToken: {
    symbol: 'AVAX',
    name: 'AVAX (Wrapped)',
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  },
  startBlock: 15795578,
}

const FantomNetworkInfo: NetworkInfo = {
  chainId: ChainId.FANTOM,
  route: 'fantom',
  poolRoute: 'fantom',
  name: 'Fantom',
  imageURL: FANTOM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-fantom'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-fantom'),
  subgraphName: 'kybernetwork/kyberswap-elastic-fantom',
  etherscanUrl: 'https://ftmscan.com',
  etherscanName: 'Ftmscan',
  tokenListUrl:
    'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/fantom.mainnet.tokenlist.json',
  nativeToken: {
    symbol: 'FTM',
    name: 'FTM (Wrapped)',
    address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  },
  startBlock: 40124588,
}

const CronosNetworkInfo: NetworkInfo = {
  chainId: ChainId.CRONOS,
  route: 'cronos',
  poolRoute: 'cronos',
  name: 'Cronos',
  imageURL: CRONOS_LOGO_URL,
  client: createClient('https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos'),
  blockClient: createBlockClient('https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/cronos-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-cronos',
  etherscanUrl: 'https://cronos.org/explorer',
  etherscanName: 'Cronos explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/cronos.tokenlist.json',
  nativeToken: {
    symbol: 'CRO',
    name: 'CRO (Wrapped)',
    address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
  },
  startBlock: 3152290,
}

const BTTCNetworkInfo: NetworkInfo = {
  chainId: ChainId.BTTC,
  route: 'bittorrent',
  poolRoute: 'bttc',
  name: 'BitTorrent',
  imageURL: BTTC_LOGO_URL,
  client: createClient('https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-bttc'),
  blockClient: createBlockClient('https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/bttc-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-bttc',
  etherscanUrl: 'https://bttcscan.com',
  etherscanName: 'Bttcscan',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/bttc.tokenlist.json',
  nativeToken: {
    symbol: 'BTT',
    name: 'BTT (Wrapped)',
    address: '0x8D193c6efa90BCFf940A98785d1Ce9D093d3DC8A',
  },
  startBlock: 7570793,
}

const VelasNetworkInfo: NetworkInfo = {
  chainId: ChainId.VELAS,
  route: 'velas',
  poolRoute: 'velas',
  name: 'Velas',
  imageURL: VELAS_LOGO_URL,
  client: createClient('https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-velas'),
  blockClient: createBlockClient('https://velas-graph.kyberengineering.io/subgraphs/name/kybernetwork/velas-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-velas',
  etherscanUrl: 'https://evmexplorer.velas.com',
  etherscanName: 'Velas EVM Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/velas.tokenlist.json',
  nativeToken: {
    symbol: 'VLX',
    name: 'VLX (Wrapped)',
    address: '0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126',
  },
  startBlock: 40962641,
}

const AuroraNetworkInfo: NetworkInfo = {
  // not support yet
  chainId: ChainId.AURORA,
  route: 'aurora',
  poolRoute: 'aurora',
  name: 'Aurora',
  imageURL: AURORA_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-aurora'),
  blockClient: createBlockClient('https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/aurora-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-aurora',
  etherscanUrl: 'https://aurorascan.dev',
  etherscanName: 'Aurora Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/aurora.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
  },
  startBlock: 0,
}

const OasisNetworkInfo: NetworkInfo = {
  chainId: ChainId.OASIS,
  route: 'oasis',
  poolRoute: 'oasis',
  name: 'Oasis',
  imageURL: OASIS_LOGO_URL,
  client: createClient('https://oasis-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-oasis'),
  blockClient: createBlockClient('https://oasis-graph.kyberengineering.io/subgraphs/name/kybernetwork/oasis-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-oasis',
  etherscanUrl: 'https://explorer.emerald.oasis.dev',
  etherscanName: 'Oasis Emerald Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/oasis.tokenlist.json',
  nativeToken: {
    symbol: 'ROSE',
    name: 'ROSE (Wrapped)',
    address: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
  },
  startBlock: 1656923,
}

const OptimismNetworkInfo: NetworkInfo = {
  chainId: ChainId.OPTIMISM,
  route: 'optimism',
  poolRoute: 'optimism',
  name: 'Optimism',
  imageURL: OPTIMISM_LOGO_URL,
  client: createClient('https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-optimism'),
  blockClient: createBlockClient('https://api.thegraph.com/subgraphs/name/kybernetwork/optimism-blocks'),
  subgraphName: 'kybernetwork/kyberswap-elastic-optimism',
  etherscanUrl: 'https://optimistic.etherscan.io',
  etherscanName: 'Optimistic Ethereum Explorer',
  tokenListUrl: 'https://raw.githubusercontent.com/KyberNetwork/ks-assets/main/tokenLists/optimism.tokenlist.json',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x4200000000000000000000000000000000000006',
  },
  startBlock: 12001267,
}

// all mapping network info
export const NETWORKS_INFO_MAP: { [id in ChainId]: NetworkInfo } = {
  [ChainId.ETHEREUM]: EthereumNetworkInfo,
  [ChainId.BSCMAINNET]: BscNetworkInfo,
  [ChainId.ROPSTEN]: RopstenNetworkInfo,
  [ChainId.RINKEBY]: RinkebyNetworkInfo,
  [ChainId.ARBITRUM]: ArbitrumNetworkInfo,
  [ChainId.POLYGON]: PolygonNetworkInfo,
  [ChainId.AVAXMAINNET]: AvaxNetworkInfo,
  [ChainId.FANTOM]: FantomNetworkInfo,
  [ChainId.CRONOS]: CronosNetworkInfo,
  [ChainId.BTTC]: BTTCNetworkInfo,
  [ChainId.VELAS]: VelasNetworkInfo,
  [ChainId.AURORA]: AuroraNetworkInfo,
  [ChainId.OASIS]: OasisNetworkInfo,
  [ChainId.OPTIMISM]: OptimismNetworkInfo,
}

// all network info
export const NETWORKS_INFO_LIST: NetworkInfo[] = Object.values(NETWORKS_INFO_MAP)

// for fetch data
export const SUPPORTED_NETWORKS: ChainId[] = Object.keys(NETWORKS_INFO_MAP).map(Number)
export const ALL_SUPPORTED_NETWORKS: ChainIdType[] = [ALL_CHAIN_ID, ...SUPPORTED_NETWORKS]

// network display menu network list
export const CLASSIC_SUPPORTED_NETWORKS: ChainIdType[] = [
  ALL_CHAIN_ID,
  ChainId.ETHEREUM,
  ChainId.POLYGON,
  ChainId.BSCMAINNET,
  ChainId.AVAXMAINNET,
  ChainId.FANTOM,
  ChainId.CRONOS,
  ChainId.ARBITRUM,
  ChainId.BTTC,
  ChainId.VELAS,
  ChainId.AURORA,
  ChainId.OASIS,
  ChainId.OPTIMISM,
] // sort by order that we want
export const ELASTIC_SUPPORTED_NETWORKS = CLASSIC_SUPPORTED_NETWORKS.filter((e: ChainIdType) => e !== ChainId.AURORA)

export const SUPPORT_POOL_FARM_API: ChainId[] = [
  // ChainId.ETHEREUM,
  // ChainId.BSCMAINNET,
  // ChainId.ROPSTEN,
  // ChainId.RINKEBY,
  // ChainId.ARBITRUM,
  // ChainId.POLYGON,
  // ChainId.AVAXMAINNET,
  // ChainId.FANTOM,
  // ChainId.CRONOS,
  // ChainId.BTTC,
  // ChainId.VELAS,
  // ChainId.AURORA,
  // ChainId.OASIS,
  // ChainId.OPTIMISM,
]
