import { useState } from 'react'
import WalletAddressInput from './WalletAddressInput'

function AuthorizeSupplierScreen({ campaigns, onSubmitAuthorization, account }) {
  const [onChainId, setOnChainId] = useState(campaigns[0]?.onChainId ?? '')
  const [supplierAddress, setSupplierAddress] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!supplierAddress.trim()) {
      setFeedbackType('error')
      setFeedbackMessage('Informe o endereço da carteira do fornecedor.')
      return
    }

    if (!supplierAddress.trim().startsWith('0x')) {
      setFeedbackType('error')
      setFeedbackMessage('Endereço de carteira inválido.')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      const result = await onSubmitAuthorization({
        onChainId: Number(onChainId),
        fornecedor: supplierAddress.trim(),
      })

      setFeedbackType('success')
      setFeedbackMessage(
        `Fornecedor autorizado! Tx: https://sepolia.etherscan.io/tx/${result.hash}`,
      )
    } catch (err) {
      setFeedbackType('error')
      setFeedbackMessage(
        err?.shortMessage || err?.message || 'Não foi possivel autorizar o fornecedor. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <h1>Autorizar Fornecedor</h1>
        <p>
          Escolha a campanha e informe o endereço do fornecedor para autorizá-lo
          on-chain via MetaMask na rede Sepolia.
        </p>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Campanha</span>
          <select
            value={onChainId}
            onChange={(event) => setOnChainId(event.target.value)}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.onChainId}>
                {campaign.nome}
              </option>
            ))}
          </select>
        </label>

        <WalletAddressInput
          label="Endereço da carteira"
          value={supplierAddress}
          onValueChange={setSupplierAddress}
          account={account}
          required
        />

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Autorizar'}
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

export default AuthorizeSupplierScreen
