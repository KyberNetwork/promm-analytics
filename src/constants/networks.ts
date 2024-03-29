import ARBITRUM_LOGO_URL from '../assets/network-logo/arbitrum.svg'
import AURORA_LOGO_URL from '../assets/network-logo/aurora.svg'
import AVAX_LOGO_URL from '../assets/network-logo/avax.png'
import BTTC_LOGO_URL from '../assets/network-logo/bittorrent.png'
import BNB_LOGO_URL from '../assets/network-logo/bnb.png'
import CRONOS_LOGO_URL from '../assets/network-logo/cronos.png'
import ETHEREUM_LOGO_URL from '../assets/network-logo/ethereum.png'
import FANTOM_LOGO_URL from '../assets/network-logo/fantom.png'
import POLYGON_LOGO_URL from '../assets/network-logo/polygon.png'
import OPTIMISM_LOGO_URL from '../assets/network-logo/optimism.svg'
import ZKSYNC_LOGO_URL from '../assets/network-logo/zksync.png'
import { ALL_CHAIN_ID } from 'constants/index'

export enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  // MUMBAI = 80001,
  // BSCTESTNET = 97,
  BSCMAINNET = 56,
  // AVAXTESTNET = 43113,
  AVAXMAINNET = 43114,
  FANTOM = 250,
  // CRONOSTESTNET = 338,
  CRONOS = 25,
  ARBITRUM = 42161,
  BTTC = 199,
  AURORA = 1313161554,
  OPTIMISM = 10,
  ZKSYNC = 324,
  LINEA = 59144,
  ZKEVM = 1101,
  BASE = 8453,
  SCROLL = 534352,
}

export type ChainIdType = ChainId | typeof ALL_CHAIN_ID

export type NetworkInfo = {
  chainId: ChainId
  route: string
  poolRoute: string
  blockServiceRoute: string
  name: string
  imageURL: string
  defaultSubgraph: string
  defaultBlockSubgraph: string
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
  priceRoute: string
  legacySubgraph: string
}

export const EthereumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ETHEREUM,
  route: 'ethereum',
  poolRoute: 'ethereum',
  priceRoute: 'ethereum',
  blockServiceRoute: 'ethereum',
  name: 'Ethereum',
  imageURL: ETHEREUM_LOGO_URL,
  defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-mainnet',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-ethereum',
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
  legacySubgraph:
    'https://ethereum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-ethereum-legacy',
}

const BscNetworkInfo: NetworkInfo = {
  chainId: ChainId.BSCMAINNET,
  route: 'bnb',
  poolRoute: 'bsc',
  priceRoute: 'bsc',
  blockServiceRoute: 'bsc',
  name: 'BNB Chain',
  imageURL: BNB_LOGO_URL,
  defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-bsc',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-bsc',
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
  legacySubgraph: 'https://bsc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-bsc-legacy',
}

const ArbitrumNetworkInfo: NetworkInfo = {
  chainId: ChainId.ARBITRUM,
  route: 'arbitrum',
  poolRoute: 'arbitrum',
  priceRoute: 'arbitrum',
  blockServiceRoute: 'arbitrum',
  name: 'Arbitrum',
  imageURL: ARBITRUM_LOGO_URL,
  defaultSubgraph: 'https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-arbitrum',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/arbitrum-blocks',
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

  legacySubgraph:
    'https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-arbitrum-legacy',
}

const PolygonNetworkInfo: NetworkInfo = {
  chainId: ChainId.POLYGON,
  route: 'polygon',
  poolRoute: 'polygon',
  priceRoute: 'polygon',
  blockServiceRoute: 'polygon',
  name: 'Polygon',
  imageURL: POLYGON_LOGO_URL,
  defaultSubgraph: 'https://polygon-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-polygon',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-polygon',
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
  legacySubgraph:
    'https://polygon-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-polygon-legacy',
}

const AvaxNetworkInfo: NetworkInfo = {
  chainId: ChainId.AVAXMAINNET,
  route: 'avalanche',
  poolRoute: 'avalanche',
  priceRoute: 'avalanche',
  blockServiceRoute: 'avalanche',
  name: 'Avalanche',
  imageURL: AVAX_LOGO_URL,
  defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-avalanche',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/ducquangkstn/avalache-blocks',
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
  legacySubgraph:
    'https://avalanche-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-avalanche-legacy',
}

const FantomNetworkInfo: NetworkInfo = {
  chainId: ChainId.FANTOM,
  route: 'fantom',
  poolRoute: 'fantom',
  priceRoute: 'fantom',
  blockServiceRoute: 'fantom',
  name: 'Fantom',
  imageURL: FANTOM_LOGO_URL,
  defaultSubgraph: 'https://fantom-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-fantom',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-fantom',
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
  legacySubgraph:
    'https://fantom-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-fantom-legacy',
}

const CronosNetworkInfo: NetworkInfo = {
  chainId: ChainId.CRONOS,
  route: 'cronos',
  poolRoute: 'cronos',
  priceRoute: 'cronos',
  blockServiceRoute: 'cronos',
  name: 'Cronos',
  imageURL: CRONOS_LOGO_URL,
  defaultSubgraph: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos',
  defaultBlockSubgraph: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/cronos-blocks',
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
  legacySubgraph:
    'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos-legacy',
}

const BTTCNetworkInfo: NetworkInfo = {
  chainId: ChainId.BTTC,
  route: 'bittorrent',
  poolRoute: 'bttc',
  priceRoute: 'bttc',
  blockServiceRoute: 'bttc',
  name: 'BitTorrent',
  imageURL: BTTC_LOGO_URL,
  defaultSubgraph: 'https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-bttc',
  defaultBlockSubgraph: 'https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/bttc-blocks',
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
  legacySubgraph: 'https://bttc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-bttc-legacy',
}

const AuroraNetworkInfo: NetworkInfo = {
  // not support yet
  chainId: ChainId.AURORA,
  route: 'aurora',
  poolRoute: 'aurora',
  priceRoute: 'aurora',
  blockServiceRoute: 'aurora',
  name: 'Aurora',
  imageURL: AURORA_LOGO_URL,
  defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-aurora',
  defaultBlockSubgraph: 'https://aurora-graph.kyberengineering.io/subgraphs/name/kybernetwork/aurora-blocks',
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
  legacySubgraph: '',
}

const OptimismNetworkInfo: NetworkInfo = {
  chainId: ChainId.OPTIMISM,
  route: 'optimism',
  poolRoute: 'optimism',
  priceRoute: 'optimism',
  blockServiceRoute: 'optimism',
  name: 'Optimism',
  imageURL: OPTIMISM_LOGO_URL,
  defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-optimism',
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
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
  legacySubgraph:
    'https://optimism-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-optimism-legacy',
}

const ZkSyncNetworkInfo: NetworkInfo = {
  chainId: ChainId.ZKSYNC,
  route: 'zksync',
  poolRoute: 'zksync',
  priceRoute: 'zksync',
  blockServiceRoute: 'zksync',
  name: 'zkSync Era',
  imageURL: ZKSYNC_LOGO_URL,
  defaultSubgraph: '',
  defaultBlockSubgraph: '',
  subgraphName: '',
  etherscanUrl: '',
  etherscanName: '',
  tokenListUrl: '',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
  },
  startBlock: 0,
  legacySubgraph: '',
}

const LineaNetworkInfo: NetworkInfo = {
  chainId: ChainId.LINEA,
  route: 'linea',
  poolRoute: 'linea',
  priceRoute: 'linea',
  blockServiceRoute: 'linea',
  name: 'Linea',
  imageURL: 'https://linea.build/apple-touch-icon.png',
  defaultSubgraph: 'https://graph-query.linea.build/subgraphs/name/kybernetwork/kyberswap-elastic-linea',
  defaultBlockSubgraph: 'https://graph-query.linea.build/subgraphs/name/kybernetwork/linea-blocks',
  subgraphName: 'kybernetwork/kyberswap-elastic-linea',
  etherscanUrl: 'https://lineascan.build',
  etherscanName: 'Linea Explorer',
  tokenListUrl: '', // TODO(viet-nv)
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
  },
  startBlock: 0,
  legacySubgraph: '',
}

const ZkEvmNetworkInfo: NetworkInfo = {
  chainId: ChainId.ZKEVM,
  route: 'polygon-zkevm',
  poolRoute: 'polygon-zkevm',
  priceRoute: 'polygon-zkevm',
  blockServiceRoute: 'polygon-zkevm',
  name: 'Polygon zkEvm',
  imageURL: 'https://wallet.polygon.technology/assets/img/zkEVM.svg',
  defaultSubgraph:
    'https://polygon-zkevm-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-polygon-zkevm',
  defaultBlockSubgraph: '',
  subgraphName: 'kybernetwork/kyberswap-elastic-polygon-zkevm',
  etherscanUrl: 'https://zkevm.polygonscan.com',
  etherscanName: 'Polygon zkEvm Explorer',
  tokenListUrl: '',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
  },
  startBlock: 4164470,
  legacySubgraph: '',
}

const BaseNetworkInfo: NetworkInfo = {
  chainId: ChainId.BASE,
  route: 'base',
  poolRoute: 'base',
  priceRoute: 'base',
  blockServiceRoute: 'base',
  name: 'Base',
  imageURL:
    'https://raw.githubusercontent.com/base-org/brand-kit/001c0e9b40a67799ebe0418671ac4e02a0c683ce/logo/in-product/Base_Network_Logo.svg',
  defaultSubgraph: 'https://base-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-base',
  defaultBlockSubgraph: '',
  subgraphName: 'kybernetwork/kyberswap-elastic-base',
  etherscanUrl: 'https://basescan.org',
  etherscanName: 'Base Explorer',
  tokenListUrl: '',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x4200000000000000000000000000000000000006',
  },
  startBlock: 2949023,
  legacySubgraph: '',
}

const ScrollNetworkInfo: NetworkInfo = {
  chainId: ChainId.SCROLL,
  route: 'scroll',
  poolRoute: 'scroll',
  priceRoute: 'scroll',
  blockServiceRoute: 'scroll',
  name: 'Scroll',
  imageURL: 'https://storage.googleapis.com/ks-setting-1d682dca/bd00114e-d4a5-4ccd-a80b-e9a1f29b1bc11697613637225.png',
  defaultSubgraph: 'https://scroll-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-scroll',
  defaultBlockSubgraph: '',
  subgraphName: 'kybernetwork/kyberswap-elastic-scroll',
  etherscanUrl: 'https://scrollscan.com',
  etherscanName: 'Scroll Explorer',
  tokenListUrl: '',
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0x5300000000000000000000000000000000000004',
  },
  startBlock: 36376,
  legacySubgraph: '',
}

// all mapping network info
export const NETWORKS_INFO_MAP: { [id in ChainId]: NetworkInfo } = {
  [ChainId.ETHEREUM]: EthereumNetworkInfo,
  [ChainId.BSCMAINNET]: BscNetworkInfo,
  [ChainId.ARBITRUM]: ArbitrumNetworkInfo,
  [ChainId.POLYGON]: PolygonNetworkInfo,
  [ChainId.AVAXMAINNET]: AvaxNetworkInfo,
  [ChainId.FANTOM]: FantomNetworkInfo,
  [ChainId.CRONOS]: CronosNetworkInfo,
  [ChainId.BTTC]: BTTCNetworkInfo,
  [ChainId.AURORA]: AuroraNetworkInfo,
  [ChainId.OPTIMISM]: OptimismNetworkInfo,
  [ChainId.ZKSYNC]: ZkSyncNetworkInfo,
  [ChainId.LINEA]: LineaNetworkInfo,
  [ChainId.ZKEVM]: ZkEvmNetworkInfo,
  [ChainId.BASE]: BaseNetworkInfo,
  [ChainId.SCROLL]: ScrollNetworkInfo,
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
  ChainId.AURORA,
  ChainId.OPTIMISM,
  ChainId.LINEA,
  ChainId.ZKSYNC,
  ChainId.ZKEVM,
  ChainId.SCROLL,
] // sort by order that we want
export const ELASTIC_SUPPORTED_NETWORKS = [
  ...CLASSIC_SUPPORTED_NETWORKS.filter(
    (e: ChainIdType) => e === 'allChain' || ![ChainId.AURORA, ChainId.ZKSYNC].includes(e)
  ),
  ChainId.BASE,
]

export const ELASTIC_LEGACY_SUPPORTED_NETWORKS = CLASSIC_SUPPORTED_NETWORKS.filter(
  (e: ChainIdType) =>
    e === 'allChain' ||
    ![ChainId.AURORA, ChainId.ZKSYNC, ChainId.LINEA, ChainId.ZKEVM, ChainId.BASE, ChainId.SCROLL].includes(e)
)

export const SUPPORT_POOL_FARM_API: ChainId[] = [
  ChainId.ETHEREUM,
  ChainId.BSCMAINNET,
  ChainId.ARBITRUM,
  ChainId.POLYGON,
  ChainId.AVAXMAINNET,
  ChainId.FANTOM,
  ChainId.CRONOS,
  // ChainId.BTTC,
  // ChainId.AURORA,
  ChainId.OPTIMISM,
]
