import { ReactNode } from 'react'
import { createSolanaDevnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'
import { WalletUiGillProvider } from '@wallet-ui/react-gill'

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet()],
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <WalletUi config={config}>
      <WalletUiGillProvider>{children}</WalletUiGillProvider>
    </WalletUi>
  )
}

// Re-export wallet-ui hooks
export { useWalletUi as useWallet } from '@wallet-ui/react'
export { useWalletUiGill as useConnection } from '@wallet-ui/react-gill'
