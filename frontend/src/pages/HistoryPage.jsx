import { useEffect } from 'react'
import PublicHistoryScreen from '../components/PublicHistoryScreen'
import { useWallet } from '../context/WalletContext'

function HistoryPage() {
  const { historyState, loadHistory } = useWallet()

  useEffect(() => {
    void loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <PublicHistoryScreen historyState={historyState} onRefresh={loadHistory} />
}

export default HistoryPage
