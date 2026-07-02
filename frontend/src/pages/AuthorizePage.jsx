import AuthorizeSupplierScreen from '../components/AuthorizeSupplierScreen'
import { useWallet } from '../context/WalletContext'

function AuthorizePage() {
  const { authorize, wallet, campaignsState } = useWallet()

  return (
    <AuthorizeSupplierScreen
      campaigns={campaignsState.items}
      onSubmitAuthorization={authorize}
      account={wallet.account}
    />
  )
}

export default AuthorizePage
