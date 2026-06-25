import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DonationScreen from '../components/DonationScreen'
import { mockCampaigns } from '../data/campaigns'
import { useWallet } from '../context/WalletContext'

function DonationPage() {
  const { onChainId } = useParams()
  const navigate = useNavigate()
  const { donate } = useWallet()

  const campaign = mockCampaigns.find(
    (item) => String(item.onChainId) === String(onChainId),
  )

  useEffect(() => {
    if (!campaign) {
      navigate('/campanhas', { replace: true })
    }
  }, [campaign, navigate])

  if (!campaign) {
    return null
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
