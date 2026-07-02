import { useNavigate } from 'react-router-dom'
import CampaignList from '../components/CampaignList'
import { useWallet } from '../context/WalletContext'

function CampaignsPage() {
  const navigate = useNavigate()
  const { campaignsState } = useWallet()

  const handleDonate = (campaign) => {
    navigate(`/campanhas/${campaign.onChainId}/doar`)
  }

  if (campaignsState.isLoading && campaignsState.items.length === 0) {
    return (
      <section className="screen-section">
        <p className="feedback-message">Carregando campanhas on-chain...</p>
      </section>
    )
  }

  if (campaignsState.status !== 'ready' && campaignsState.items.length === 0) {
    return (
      <section className="screen-section">
        <p className="feedback-message feedback-message--error">
          {campaignsState.message || 'Não foi possível carregar as campanhas.'}
        </p>
      </section>
    )
  }

  return <CampaignList campaigns={campaignsState.items} onDonate={handleDonate} />
}

export default CampaignsPage
