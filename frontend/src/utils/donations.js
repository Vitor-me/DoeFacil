import { getContract, parseEther } from './ethers'

export async function donate({ onChainId, amountInEth }) {
  const contract = await getContract()
  const tx = await contract.doar(onChainId, {
    value: parseEther(String(amountInEth)),
  })
  await tx.wait()

  return {
    success: true,
    hash: tx.hash,
  }
}
