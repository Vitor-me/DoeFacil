import { useState } from 'react'
import heroImg from './assets/hero.png'
import AuthorizeSupplierScreen from './components/AuthorizeSupplierScreen'
import CampaignList from './components/CampaignList'
import DonationScreen from './components/DonationScreen'
import GovernanceScreen from './components/GovernanceScreen'
import WithdrawScreen from './components/WithdrawScreen'
import { mockCampaigns } from './data/campaigns'
import { donate } from './utils/donations'
import { authorizeSupplier, withdrawFunds } from './utils/sprint3'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState(null)

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

  const handleSubmitDonation = async ({ campaignId, amountInEth }) => {
    await donate({
      campaignId,
      amountInEth,
    })
  }

  const handleAuthorizeSupplier = async (address) => {
    await authorizeSupplier(address)
  }

  const handleWithdrawFunds = async (amountInEth) => {
    await withdrawFunds(amountInEth)
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
              currentScreen === 'governance'
                ? 'nav-button nav-button--active'
                : 'nav-button'
            }
            onClick={() => handleNavigate('governance')}
          >
            Governanca
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
          <AuthorizeSupplierScreen onSubmitAuthorization={handleAuthorizeSupplier} />
        ) : null}

        {currentScreen === 'withdraw' ? (
          <WithdrawScreen onSubmitWithdraw={handleWithdrawFunds} />
        ) : null}
        {currentScreen === 'governance' ? <GovernanceScreen /> : null}
      </section>
    </main>
  )
}

export default App
