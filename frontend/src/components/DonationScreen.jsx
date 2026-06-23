import { useState } from 'react'

function formatEth(value) {
  return `${value.toFixed(2)} ETH`
}

function DonationScreen({ campaign, onBack, onSubmitDonation }) {
  const [amountInEth, setAmountInEth] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!Number(amountInEth) || Number(amountInEth) <= 0) {
      setFeedbackType('error')
      setFeedbackMessage('Informe um valor maior que zero para realizar a doacao.')
      return
    }

    setIsSubmitting(true)
    setFeedbackMessage('')
    setFeedbackType('')

    try {
      const result = await onSubmitDonation({
        onChainId: campaign.onChainId,
        amountInEth,
      })

      setFeedbackType('success')
      setFeedbackMessage(
        `Doação confirmada! Tx: https://sepolia.etherscan.io/tx/${result.hash}`,
      )
    } catch (err) {
      setFeedbackType('error')
      setFeedbackMessage(
        err?.shortMessage || err?.message || 'Não foi possivel processar a doação. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="screen-section">
      <button type="button" className="secondary-button" onClick={onBack}>
        Voltar para campanhas
      </button>

      <div className="section-header section-header--left">
        <span className="eyebrow">Doação</span>
        <h1>{campaign.nome}</h1>
        <p>Meta: {formatEth(campaign.metaEth)}</p>
        <p>Arrecadado: {formatEth(campaign.arrecadadoEth)}</p>
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
          {isSubmitting ? 'Processando...' : 'Confirmar doação'}
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

export default DonationScreen
