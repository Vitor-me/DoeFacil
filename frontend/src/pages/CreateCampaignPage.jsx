import CreateCampaignScreen from '../components/CreateCampaignScreen'
import { useWallet } from '../context/WalletContext'

function CreateCampaignPage() {
  const { createCampaign, wallet, roles } = useWallet()

  let notice = ''
  if (!wallet.isConnected) {
    notice = 'Conecte sua carteira MetaMask (rede Sepolia) para criar campanhas.'
  } else if (!roles.isVerifiedOng) {
    notice =
      'Sua carteira não é uma ONG verificada. Peça a verificação ao administrador antes de criar campanhas.'
  }

  const canCreate = wallet.isConnected && roles.isVerifiedOng

  return (
    <CreateCampaignScreen
      onSubmitCampaign={createCampaign}
      canCreate={canCreate}
      notice={notice}
    />
  )
}

export default CreateCampaignPage
