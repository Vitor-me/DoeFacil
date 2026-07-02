import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import DonationPage from './pages/DonationPage'
import AuthorizePage from './pages/AuthorizePage'
import WithdrawPage from './pages/WithdrawPage'
import HistoryPage from './pages/HistoryPage'
import GovernancePage from './pages/GovernancePage'
import VerifyOngPage from './pages/VerifyOngPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'campanhas', element: <CampaignsPage /> },
      { path: 'campanhas/nova', element: <CreateCampaignPage /> },
      { path: 'campanhas/:onChainId/doar', element: <DonationPage /> },
      { path: 'autorizar', element: <AuthorizePage /> },
      { path: 'saque', element: <WithdrawPage /> },
      { path: 'historico', element: <HistoryPage /> },
      { path: 'governanca', element: <GovernancePage /> },
      { path: 'admin', element: <VerifyOngPage /> },
    ],
  },
])
