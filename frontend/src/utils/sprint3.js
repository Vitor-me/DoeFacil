import { getContract, parseEther } from './ethers'

export async function authorizeSupplier({ onChainId, fornecedor }) {
  const contract = await getContract()
  const tx = await contract.autorizar_fornecedor(onChainId, fornecedor)
  await tx.wait()

  return {
    success: true,
    hash: tx.hash,
  }
}

export async function withdrawFunds({ onChainId, amountInEth, fornecedor }) {
  const contract = await getContract()
  const tx = await contract.sacar(onChainId, parseEther(String(amountInEth)), fornecedor)
  await tx.wait()

  return {
    success: true,
    hash: tx.hash,
  }
}
