import { useState } from 'react'

function AuthorizeSupplierScreen({ onSubmitAuthorization }) {
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
      setFeedbackMessage('Endereço de carteira invalidálido.')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      await onSubmitAuthorization(supplierAddress)

      setFeedbackType('success')
      setFeedbackMessage('Fornecedor enviado para autorização (simulação).')
    } catch {
      setFeedbackType('error')
      setFeedbackMessage('Não foi possivel autorizar o fornecedor. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <span className="eyebrow">Sprint 3</span>
        <h1>Autorizar Fornecedor</h1>
        <p>
          Informe o endereço da carteira para preparar a futura integração com
          Ethers.js e a rede Sepolia.
        </p>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Endereço da carteira</span>
          <input
            type="text"
            value={supplierAddress}
            onChange={(event) => setSupplierAddress(event.target.value)}
            placeholder="0x..."
            required
          />
        </label>

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
