import { useNavigate } from 'react-router-dom'
import CampaignList from '../components/CampaignList'
import { mockCampaigns } from '../data/campaigns'

function CampaignsPage() {
  const navigate = useNavigate()

  const handleDonate = (campaign) => {
    navigate(`/campanhas/${campaign.onChainId}/doar`)
  }

  return <CampaignList campaigns={mockCampaigns} onDonate={handleDonate} />
}

export default CampaignsPage
