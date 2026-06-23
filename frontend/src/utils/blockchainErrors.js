export function getBlockchainErrorMessage(error) {
  if (!error) {
    return 'Falha na transação. Tente novamente.'
  }

  if (error.message) {
    if (
      error.message === 'MetaMask não instalada.' ||
      error.message === 'Carteira não conectada.' ||
      error.message === 'Rede incorreta. Conecte a carteira na Sepolia.' ||
      error.message === 'Rede incorreta (não Sepolia).' ||
      error.message === 'Saldo insuficiente para concluir a transação.' ||
      error.message === 'Contrato ainda não configurado no frontend.'
    ) {
      return error.message
    }
  }

  const errorCode = error.code ?? error.info?.error?.code
  const errorMessage = [
    error.shortMessage,
    error.reason,
    error.message,
    error.info?.error?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (errorCode === 4001 || errorMessage.includes('user rejected')) {
    return 'Usuário recusou a assinatura.'
  }

  if (errorMessage.includes('insufficient funds')) {
    return 'Saldo insuficiente para concluir a transação.'
  }

  if (errorMessage.includes('metamask')) {
    return 'MetaMask não instalada.'
  }

  if (errorMessage.includes('not sepolia')) {
    return 'Rede incorreta (não Sepolia).'
  }

  if (errorMessage.includes('chain') || errorMessage.includes('sepolia')) {
    return 'Rede incorreta (não Sepolia).'
  }

  if (
    errorMessage.includes('missing revert data') ||
    errorMessage.includes('execution reverted')
  ) {
    return 'Falha na transação. Verifique permissões, saldo e dados informados.'
  }

  return 'Falha na transação. Tente novamente.'
}
