import { useState } from 'react'
import WalletAddressInput from './WalletAddressInput'

function WithdrawScreen({ campaigns, onSubmitWithdraw, account }) {
  const [onChainId, setOnChainId] = useState('')
  const [amountInEth, setAmountInEth] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // As campanhas carregam on-chain (async): usa a seleção atual ou, na falta,
  // a primeira campanha disponível — sem precisar sincronizar via efeito.
  const selectedId = onChainId || (campaigns[0]?.onChainId ?? '')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!Number(amountInEth) || Number(amountInEth) <= 0) {
      setFeedbackType('error')
      setFeedbackMessage('Informe um valor maior que zero para realizar o saque.')
      return
    }

    if (!fornecedor.trim().startsWith('0x')) {
      setFeedbackType('error')
      setFeedbackMessage('Informe um endereço de fornecedor válido (0x...).')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      const result = await onSubmitWithdraw({
        onChainId: Number(selectedId),
        amountInEth,
        fornecedor: fornecedor.trim(),
      })

      setFeedbackType('success')
      setFeedbackMessage(
        `Saque realizado! Tx: https://sepolia.etherscan.io/tx/${result.hash}`,
      )
    } catch (err) {
      setFeedbackType('error')
      setFeedbackMessage(
        err?.shortMessage || err?.message || 'Não foi possível processar o saque. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <h1>Saque</h1>
        <p>
          Escolha a campanha, o valor em ETH e o fornecedor para sacar on-chain
          via MetaMask na rede Sepolia.
        </p>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Campanha</span>
          <select
            value={selectedId}
            onChange={(event) => setOnChainId(event.target.value)}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.onChainId}>
                {campaign.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Valor em ETH</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amountInEth}
            onChange={(event) => setAmountInEth(event.target.value)}
            placeholder="0.10"
            required
          />
        </label>

        <WalletAddressInput
          label="Endereço do fornecedor"
          value={fornecedor}
          onValueChange={setFornecedor}
          account={account}
          required
        />

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Sacar'}
        </button>
      </form>

      {feedbackMessage ? (
        <p
          className={
            feedbackType === 'error'
              ? 'feedback-message feedback-message--error'
              : 'feedback-message feedback-message--success'
          }
        >
          {feedbackMessage}
        </p>
      ) : null}
    </section>
  )
}

export default WithdrawScreen
