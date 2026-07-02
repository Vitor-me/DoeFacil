import { useState } from 'react'
import WalletAddressInput from './WalletAddressInput'

function VerifyOngScreen({ onSubmitVerification, canVerify, notice, account }) {
  const [ongAddress, setOngAddress] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!ongAddress.trim().startsWith('0x')) {
      setFeedbackType('error')
      setFeedbackMessage('Informe um endereço de ONG válido (0x...).')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      const result = await onSubmitVerification({ carteira: ongAddress.trim() })
      setFeedbackType('success')
      setFeedbackMessage(
        `ONG verificada! Tx: https://sepolia.etherscan.io/tx/${result.hash}`,
      )
      setOngAddress('')
    } catch (err) {
      setFeedbackType('error')
      setFeedbackMessage(
        err?.shortMessage || err?.message || 'Não foi possível verificar a ONG. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <span className="eyebrow">Admin</span>
        <h1>Verificar ONG</h1>
        <p>
          Somente o administrador (owner do contrato) pode verificar ONGs. Uma
          vez verificada, a ONG pode criar campanhas.
        </p>
      </div>

      {notice ? <p className="feedback-message feedback-message--error">{notice}</p> : null}

      <form className="donation-form" onSubmit={handleSubmit}>
        <WalletAddressInput
          label="Endereço da ONG"
          value={ongAddress}
          onValueChange={setOngAddress}
          account={account}
          required
        />

        <button type="submit" className="primary-button" disabled={!canVerify || isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Verificar ONG'}
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

export default VerifyOngScreen
