import { parseEther } from 'ethers'
import { createContext, useContext, useEffect, useState } from 'react'
import sepolia from '../contracts/sepolia.json'
import { donate } from '../utils/donations'
import { getBlockchainErrorMessage } from '../utils/blockchainErrors'
import {
  connectWallet,
  getWalletState,
  subscribeToWalletEvents,
} from '../utils/ethers'
import { fetchPublicHistory } from '../utils/publicHistory'
import { authorizeSupplier, withdrawFunds } from '../utils/sprint3'
import {
  criarCampanha,
  fetchCampaigns,
  fetchRoles,
  verificarOng,
} from '../utils/campaigns'

const INITIAL_WALLET_STATE = {
  account: '',
  balanceInWei: '',
  chainId: null,
  isMetaMaskInstalled: false,
  isConnected: false,
  isSepolia: false,
}

const INITIAL_HISTORY_STATE = {
  isLoading: false,
  items: [],
  message: '',
  status: 'idle',
}

const INITIAL_CAMPAIGNS_STATE = {
  isLoading: false,
  items: [],
  message: '',
  status: 'idle',
}

const INITIAL_ROLES = {
  isOwner: false,
  isVerifiedOng: false,
}

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(INITIAL_WALLET_STATE)
  const [walletStatusMessage, setWalletStatusMessage] = useState(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [historyState, setHistoryState] = useState(INITIAL_HISTORY_STATE)
  const [campaignsState, setCampaignsState] = useState(INITIAL_CAMPAIGNS_STATE)
  const [roles, setRoles] = useState(INITIAL_ROLES)

  const isContractConfigured =
    Boolean(sepolia.endereco) && sepolia.abi.length > 0

  const syncWallet = async () => {
    try {
      const nextWallet = await getWalletState()
      setWallet(nextWallet)
    } catch (error) {
      setWallet(INITIAL_WALLET_STATE)
      setWalletStatusMessage({
        type: 'error',
        text: getBlockchainErrorMessage(error),
      })
    }
  }

  const loadPublicHistory = async () => {
    setHistoryState((current) => ({ ...current, isLoading: true }))

    try {
      const result = await fetchPublicHistory()
      setHistoryState({
        isLoading: false,
        items: result.items,
        message: result.message,
        status: result.status,
      })
    } catch (error) {
      setHistoryState({
        isLoading: false,
        items: [],
        message: getBlockchainErrorMessage(error),
        status: 'error',
      })
    }
  }

  const loadCampaigns = async () => {
    setCampaignsState((current) => ({ ...current, isLoading: true }))

    try {
      const result = await fetchCampaigns()
      setCampaignsState({
        isLoading: false,
        items: result.items,
        message: result.message,
        status: result.status,
      })
    } catch (error) {
      setCampaignsState({
        isLoading: false,
        items: [],
        message: getBlockchainErrorMessage(error),
        status: 'error',
      })
    }
  }

  const loadRoles = async (account) => {
    try {
      setRoles(await fetchRoles(account))
    } catch {
      setRoles(INITIAL_ROLES)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      const nextWallet = await getWalletState().catch(() => INITIAL_WALLET_STATE)
      setWallet(nextWallet)
      await Promise.all([
        loadPublicHistory(),
        loadCampaigns(),
        loadRoles(nextWallet.account),
      ])
    }

    void initialize()

    const refreshWalletAndRoles = async () => {
      const nextWallet = await getWalletState().catch(() => INITIAL_WALLET_STATE)
      setWallet(nextWallet)
      await loadRoles(nextWallet.account)
    }

    const unsubscribe = subscribeToWalletEvents({
      onAccountsChanged: () => {
        void refreshWalletAndRoles()
      },
      onChainChanged: () => {
        void refreshWalletAndRoles()
        void loadPublicHistory()
        void loadCampaigns()
      },
    })

    return unsubscribe
  }, [])

  const handleConnectWallet = async () => {
    try {
      setIsConnectingWallet(true)
      const nextWallet = await connectWallet()
      setWallet(nextWallet)
      setWalletStatusMessage({
        type: 'success',
        text: 'Carteira conectada com sucesso.',
      })
    } catch (error) {
      setWalletStatusMessage({
        type: 'error',
        text: getBlockchainErrorMessage(error),
      })
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const ensureReadyForTransaction = (amountInEth) => {
    if (!wallet.isMetaMaskInstalled) {
      throw new Error('MetaMask não instalada.')
    }
    if (!wallet.isConnected) {
      throw new Error('Carteira não conectada.')
    }
    if (!wallet.isSepolia) {
      throw new Error('Rede incorreta (não Sepolia).')
    }
    if (amountInEth) {
      const requiredAmount = parseEther(String(amountInEth))
      const currentBalance = BigInt(wallet.balanceInWei || '0')
      if (currentBalance < requiredAmount) {
        throw new Error('Saldo insuficiente para concluir a transação.')
      }
    }
  }

  const handleSubmitDonation = async ({ onChainId, amountInEth }) => {
    try {
      ensureReadyForTransaction(amountInEth)
      const result = await donate({ onChainId, amountInEth })
      setWalletStatusMessage({
        type: 'success',
        text: 'Doação realizada com sucesso.',
      })
      await syncWallet()
      await loadPublicHistory()
      return result
    } catch (error) {
      throw new Error(getBlockchainErrorMessage(error), { cause: error })
    }
  }

  const handleAuthorizeSupplier = async ({ onChainId, fornecedor }) => {
    try {
      ensureReadyForTransaction()
      const result = await authorizeSupplier({ onChainId, fornecedor })
      setWalletStatusMessage({
        type: 'success',
        text: 'Fornecedor autorizado com sucesso.',
      })
      await loadPublicHistory()
      return result
    } catch (error) {
      throw new Error(getBlockchainErrorMessage(error), { cause: error })
    }
  }

  const handleWithdrawFunds = async ({ onChainId, amountInEth, fornecedor }) => {
    try {
      ensureReadyForTransaction(amountInEth)
      const result = await withdrawFunds({ onChainId, amountInEth, fornecedor })
      setWalletStatusMessage({
        type: 'success',
        text: 'Saque realizado com sucesso.',
      })
      await syncWallet()
      await loadPublicHistory()
      return result
    } catch (error) {
      throw new Error(getBlockchainErrorMessage(error), { cause: error })
    }
  }

  const handleCreateCampaign = async ({ titulo, metaEth, prazo }) => {
    try {
      ensureReadyForTransaction()
      const result = await criarCampanha({ titulo, metaEth, prazo })
      setWalletStatusMessage({
        type: 'success',
        text: 'Campanha criada com sucesso.',
      })
      await loadCampaigns()
      await loadPublicHistory()
      return result
    } catch (error) {
      throw new Error(getBlockchainErrorMessage(error), { cause: error })
    }
  }

  const handleVerifyOng = async ({ carteira }) => {
    try {
      ensureReadyForTransaction()
      const result = await verificarOng({ carteira })
      setWalletStatusMessage({
        type: 'success',
        text: 'ONG verificada com sucesso.',
      })
      await loadRoles(wallet.account)
      await loadPublicHistory()
      return result
    } catch (error) {
      throw new Error(getBlockchainErrorMessage(error), { cause: error })
    }
  }

  const value = {
    wallet,
    walletStatusMessage,
    isConnectingWallet,
    isContractConfigured,
    historyState,
    campaignsState,
    roles,
    connect: handleConnectWallet,
    loadHistory: loadPublicHistory,
    loadCampaigns,
    donate: handleSubmitDonation,
    authorize: handleAuthorizeSupplier,
    withdraw: handleWithdrawFunds,
    createCampaign: handleCreateCampaign,
    verifyOng: handleVerifyOng,
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === null) {
    throw new Error('useWallet deve ser usado dentro de <WalletProvider>.')
  }
  return context
}
