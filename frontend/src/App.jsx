import { parseEther } from 'ethers'
import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import AuthorizeSupplierScreen from './components/AuthorizeSupplierScreen'
import CampaignList from './components/CampaignList'
import DonationScreen from './components/DonationScreen'
import PublicHistoryScreen from './components/PublicHistoryScreen'
import WalletPanel from './components/WalletPanel'
import WithdrawScreen from './components/WithdrawScreen'
import sepolia from './contracts/sepolia.json'
import { mockCampaigns } from './data/campaigns'
import { donate } from './utils/donations'
import { getBlockchainErrorMessage } from './utils/blockchainErrors'
import {
  connectWallet,
  getWalletState,
  subscribeToWalletEvents,
} from './utils/ethers'
import { fetchPublicHistory } from './utils/publicHistory'
import { authorizeSupplier, withdrawFunds } from './utils/sprint3'
import './App.css'

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

function App() {
  const [currentScreen, setCurrentScreen] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [wallet, setWallet] = useState(INITIAL_WALLET_STATE)
  const [walletStatusMessage, setWalletStatusMessage] = useState(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [historyState, setHistoryState] = useState(INITIAL_HISTORY_STATE)

  const isContractConfigured = Boolean(sepolia.endereco) && sepolia.abi.length > 0

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
    setHistoryState((current) => ({
      ...current,
      isLoading: true,
    }))

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

  const handleOpenDonation = (campaign) => {
    setCurrentScreen('donation')
    setSelectedCampaign(campaign)
  }

  const handleBackToCampaigns = () => {
    setCurrentScreen('campaigns')
    setSelectedCampaign(null)
  }

  const handleNavigate = (screen) => {
    if (screen !== 'donation') {
      setSelectedCampaign(null)
    }

    setCurrentScreen(screen)

    if (screen === 'history') {
      void loadPublicHistory()
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
      throw new Error(getBlockchainErrorMessage(error), {
        cause: error,
      })
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
      throw new Error(getBlockchainErrorMessage(error), {
        cause: error,
      })
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
      throw new Error(getBlockchainErrorMessage(error), {
        cause: error,
      })
    }
  }

  return (
    <main className="app-shell">
      <section className="app-panel">
        <div className="hero-banner">
          <img src={heroImg} className="hero-image" alt="Ilustracao da plataforma DoeFacil" />
          <div className="hero-banner__copy">
            <span className="eyebrow">DoeFacil</span>
            <p>
              Interface profissional para campanhas, doações, autorizações,
              saques e histórico público integrada à MetaMask e Ethereum
              Sepolia.
            </p>
          </div>
        </div>

        <WalletPanel
          wallet={wallet}
          onConnect={handleConnectWallet}
          isConnecting={isConnectingWallet}
          isContractConfigured={isContractConfigured}
          statusMessage={walletStatusMessage}
        />

        <nav className="screen-nav" aria-label="Navegacao principal">
          <button
            type="button"
            className={
              currentScreen === 'campaigns' || currentScreen === 'donation'
                ? 'nav-button nav-button--active'
                : 'nav-button'
            }
            onClick={() => handleNavigate('campaigns')}
          >
            Campanhas
          </button>
          <button
            type="button"
            className={
              currentScreen === 'authorize-supplier'
                ? 'nav-button nav-button--active'
                : 'nav-button'
            }
            onClick={() => handleNavigate('authorize-supplier')}
          >
            Autorizar Fornecedor
          </button>
          <button
            type="button"
            className={
              currentScreen === 'withdraw'
                ? 'nav-button nav-button--active'
                : 'nav-button'
            }
            onClick={() => handleNavigate('withdraw')}
          >
            Saque
          </button>
          <button
            type="button"
            className={
              currentScreen === 'history'
                ? 'nav-button nav-button--active'
                : 'nav-button'
            }
            onClick={() => handleNavigate('history')}
          >
            Histórico Público
          </button>
        </nav>

        {currentScreen === 'donation' && selectedCampaign ? (
          <DonationScreen
            campaign={selectedCampaign}
            onBack={handleBackToCampaigns}
            onSubmitDonation={handleSubmitDonation}
          />
        ) : null}

        {currentScreen === 'campaigns' ? (
          <CampaignList campaigns={mockCampaigns} onDonate={handleOpenDonation} />
        ) : null}

        {currentScreen === 'authorize-supplier' ? (
          <AuthorizeSupplierScreen
            campaigns={mockCampaigns}
            onSubmitAuthorization={handleAuthorizeSupplier}
          />
        ) : null}

        {currentScreen === 'withdraw' ? (
          <WithdrawScreen
            campaigns={mockCampaigns}
            onSubmitWithdraw={handleWithdrawFunds}
          />
        ) : null}

        {currentScreen === 'history' ? (
          <PublicHistoryScreen
            historyState={historyState}
            onRefresh={loadPublicHistory}
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
