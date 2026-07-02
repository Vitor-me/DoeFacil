import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DonationScreen from '../components/DonationScreen'
import { useWallet } from '../context/WalletContext'

function DonationPage() {
  const { onChainId } = useParams()
  const navigate = useNavigate()
  const { donate, campaignsState } = useWallet()

  const campaign = campaignsState.items.find(
    (item) => String(item.onChainId) === String(onChainId),
  )

  const finishedLoading =
    !campaignsState.isLoading && campaignsState.status !== 'idle'

  useEffect(() => {
    if (finishedLoading && !campaign) {
      navigate('/campanhas', { replace: true })
    }
  }, [finishedLoading, campaign, navigate])

  if (!campaign) {
    return (
      <section className="screen-section">
        <p className="feedback-message">Carregando campanha...</p>
      </section>
    )
  }

  return (
    <DonationScreen
      campaign={campaign}
      onBack={() => navigate('/campanhas')}
      onSubmitDonation={donate}
    />
  )
}

export default DonationPage
