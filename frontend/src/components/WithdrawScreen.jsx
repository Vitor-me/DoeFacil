import { useState } from 'react'

function WithdrawScreen({ onSubmitWithdraw }) {
  const [amountInEth, setAmountInEth] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (Number(amountInEth) <= 0) {
      setFeedbackType('error')
      setFeedbackMessage('Informe um valor maior que zero para realizar o saque.')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      await onSubmitWithdraw(amountInEth)

      setFeedbackType('success')
      setFeedbackMessage('Saque enviado para processamento (simulação).')
    } catch {
      setFeedbackType('error')
      setFeedbackMessage('Não foi possível processar o saque. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <div className="section-header section-header--left">
        <span className="eyebrow">Sprint 3</span>
        <h1>Saque</h1>
        <p>
          Informe o valor em ETH para preparar a futura integração com
          Ethers.js e o contrato na rede Sepolia.
        </p>
      </div>

      <form className="donation-form" onSubmit={handleSubmit}>
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
