import WithdrawScreen from '../components/WithdrawScreen'
import { useWallet } from '../context/WalletContext'

function WithdrawPage() {
  const { withdraw, wallet, campaignsState } = useWallet()

  return (
    <WithdrawScreen
      campaigns={campaignsState.items}
      onSubmitWithdraw={withdraw}
      account={wallet.account}
    />
  )
}

export default WithdrawPage
