import VerifyOngScreen from '../components/VerifyOngScreen'
import { useWallet } from '../context/WalletContext'

function VerifyOngPage() {
  const { verifyOng, wallet, roles } = useWallet()

  let notice = ''
  if (!wallet.isConnected) {
    notice = 'Conecte a carteira do administrador (rede Sepolia) para verificar ONGs.'
  } else if (!roles.isOwner) {
    notice = 'Apenas o administrador (owner do contrato) pode verificar ONGs.'
  }

  const canVerify = wallet.isConnected && roles.isOwner

  return (
    <VerifyOngScreen
      onSubmitVerification={verifyOng}
      canVerify={canVerify}
      notice={notice}
      account={wallet.account}
    />
  )
}

export default VerifyOngPage
