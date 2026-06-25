import GovernanceScreen from '../components/GovernanceScreen'
import { useWallet } from '../context/WalletContext'

function GovernancePage() {
  const { wallet } = useWallet()

  return <GovernanceScreen account={wallet.account} />
}

export default GovernancePage
