import AuthorizeSupplierScreen from '../components/AuthorizeSupplierScreen'
import { mockCampaigns } from '../data/campaigns'
import { useWallet } from '../context/WalletContext'

function AuthorizePage() {
  const { authorize, wallet } = useWallet()

  return (
    <AuthorizeSupplierScreen
      campaigns={mockCampaigns}
      onSubmitAuthorization={authorize}
      account={wallet.account}
    />
  )
}

export default AuthorizePage
