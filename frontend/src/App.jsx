import { useState } from 'react'
import heroImg from './assets/hero.png'
import AuthorizeSupplierScreen from './components/AuthorizeSupplierScreen'
import CampaignList from './components/CampaignList'
import DonationScreen from './components/DonationScreen'
import WithdrawScreen from './components/WithdrawScreen'
import { mockCampaigns } from './data/campaigns'
import { donate } from './utils/donations'
import { connectWallet } from './utils/ethers'
import { authorizeSupplier, withdrawFunds } from './utils/sprint3'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [account, setAccount] = useState(null)
  const [walletError, setWalletError] = useState('')

  const handleConnectWallet = async () => {
    setWalletError('')
    try {
      const address = await connectWallet()
      setAccount(address)
    } catch (err) {
      setWalletError(err.message || 'Falha ao conectar a carteira.')
    }
  }

  const shortAddress = account
    ? `${account.slice(0, 6)}…${account.slice(-4)}`
    : null

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
  }

  const handleSubmitDonation = async ({ onChainId, amountInEth }) => {
    return donate({ onChainId, amountInEth })
  }

  const handleAuthorizeSupplier = async ({ onChainId, fornecedor }) => {
    return authorizeSupplier({ onChainId, fornecedor })
  }

  const handleWithdrawFunds = async ({ onChainId, amountInEth, fornecedor }) => {
    return withdrawFunds({ onChainId, amountInEth, fornecedor })
  }

  return (
    <main className="app-shell">
      <section className="app-panel">
        <div className="hero-banner">
          <img src={heroImg} className="hero-image" alt="Ilustracao da plataforma DoeFacil" />
          <div className="hero-banner__copy">
            <span className="eyebrow">DoeFacil</span>
            <p>
              Frontend das Sprints 2 e 3 com campanhas, doacao, autorizacao de
              fornecedor e saque.
            </p>
          </div>
        </div>

        <div className="wallet-bar">
          {account ? (
            <span className="wallet-bar__address">Carteira: {shortAddress}</span>
          ) : (
            <button
              type="button"
              className="secondary-button"
              onClick={handleConnectWallet}
            >
              Conectar carteira
            </button>
          )}
          {walletError ? (
            <span className="feedback-message feedback-message--error">
              {walletError}
            </span>
          ) : null}
        </div>

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
      </section>
    </main>
  )
}

export default App
