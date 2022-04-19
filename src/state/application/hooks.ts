import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { EthereumNetworkInfo, NetworkInfo, NETWORKS_INFO_LIST, NETWORKS_INFO_MAP } from 'constants/networks'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { isAllChain } from 'utils'
import { AppDispatch, AppState } from '../index'
import { ApplicationModal, PopupContent, setOpenModal, updateSubgraphStatus } from './actions'

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

// returns a function that allows adding a popup
export function useSubgraphStatus(): [
  {
    available: boolean | null
    syncedBlock: number | undefined
    headBlock: number | undefined
  },
  (available: boolean | null, syncedBlock: number | undefined, headBlock: number | undefined) => void
] {
  const dispatch = useDispatch()
  const status = useSelector((state: AppState) => state.application.subgraphStatus)

  const update = useCallback(
    (available: boolean | null, syncedBlock: number | undefined, headBlock: number | undefined) => {
      dispatch(updateSubgraphStatus({ available, syncedBlock, headBlock }))
    },
    [dispatch]
  )
  return [status, update]
}

export function useActiveNetworks(): NetworkInfo[] {
  const location = useLocation()
  const networkFromURL = location.pathname.split('/')[1]
  const networks = useMemo(() => {
    const networkInfoFromURL = networkFromURL
      ? NETWORKS_INFO_LIST.find((network) => networkFromURL === network.route)
      : null
    return networkInfoFromURL ? [networkInfoFromURL] : NETWORKS_INFO_LIST
  }, [networkFromURL])

  return networks
}

export function useActiveNetworkUtils(): { isAllChain: boolean } {
  const activeNetworks = useActiveNetworks()
  return {
    isAllChain: isAllChain(activeNetworks),
  }
}

// Get all required subgraph clients
export function useClients(): {
  dataClient: ApolloClient<NormalizedCacheObject>
  blockClient: ApolloClient<NormalizedCacheObject>
}[] {
  const activeNetwork = useActiveNetworks()

  // const dataClient = activeNetwork.map((network) => network.client)
  // const blockClient = activeNetwork.map((network) => network.blockClient)
  return activeNetwork.map((network) => ({
    dataClient: network.client,
    blockClient: network.blockClient,
  }))
}
