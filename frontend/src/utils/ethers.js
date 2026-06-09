import { BrowserProvider } from 'ethers'

export function getProvider() {
  if (!window.ethereum) {
    return null
  }

  return new BrowserProvider(window.ethereum)
}
