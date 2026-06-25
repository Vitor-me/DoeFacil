// Campo de endereco de carteira com botao "Usar minha carteira", que preenche
// o input com o endereco da MetaMask conectada (passado via prop `account`).
function WalletAddressInput({
  label,
  value,
  onValueChange,
  account,
  placeholder = '0x...',
  required = false,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field__input-row">
        <input
          type="text"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="use-wallet-button"
          onClick={() => onValueChange(account)}
          disabled={!account}
          title={
            account
              ? 'Preencher com a carteira conectada'
              : 'Conecte a carteira primeiro'
          }
        >
          Usar minha carteira
        </button>
      </div>
    </label>
  )
}

export default WalletAddressInput
