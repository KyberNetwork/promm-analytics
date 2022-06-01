import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { NetworkInfo, NETWORKS_INFO_MAP } from 'constants/networks'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAllChain } from 'utils'
import { AppDispatch, AppState } from '../index'
import { ApplicationModal, setOpenModal, updateSubgraphStatus } from './actions'

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
  const activeNetworksId = useSelector((state: AppState) => state.application.activeNetworksId)
  return useMemo(() => activeNetworksId.map((id) => NETWORKS_INFO_MAP[id]), [activeNetworksId])
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
