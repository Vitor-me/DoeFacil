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

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(INITIAL_WALLET_STATE)
  const [walletStatusMessage, setWalletStatusMessage] = useState(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [historyState, setHistoryState] = useState(INITIAL_HISTORY_STATE)

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

  useEffect(() => {
    const initialize = async () => {
      await syncWallet()
      await loadPublicHistory()
    }

    void initialize()

    const unsubscribe = subscribeToWalletEvents({
      onAccountsChanged: () => {
        void syncWallet()
      },
      onChainChanged: () => {
        void syncWallet()
        void loadPublicHistory()
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

  const value = {
    wallet,
    walletStatusMessage,
    isConnectingWallet,
    isContractConfigured,
    historyState,
    connect: handleConnectWallet,
    loadHistory: loadPublicHistory,
    donate: handleSubmitDonation,
    authorize: handleAuthorizeSupplier,
    withdraw: handleWithdrawFunds,
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
