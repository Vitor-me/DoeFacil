import WithdrawScreen from '../components/WithdrawScreen'
import { mockCampaigns } from '../data/campaigns'
import { useWallet } from '../context/WalletContext'

function WithdrawPage() {
  const { withdraw, wallet } = useWallet()

  return (
    <WithdrawScreen
      campaigns={mockCampaigns}
      onSubmitWithdraw={withdraw}
      account={wallet.account}
    />
  )
}

export default WithdrawPage
