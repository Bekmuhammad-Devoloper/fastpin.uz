import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Route, Routes } from 'react-router-dom'
import ErrorPage from './pages/Error/ErrorPage'
import Register from './pages/Register/Register'
import HomePage from './pages/home/HomePage'
import Announcements from './pages/announcements/Announcements'
import Profile from './pages/Profile/Profile'
import About from './pages/About/About'
import GamePage from './pages/games/GamePage'
import GameModal from './components/modal/GameModal'
import OfferModal from './components/modal/OfferModal'
import Cart from './pages/Cart/Cart'
import Wallet from './pages/Wallet/Wallet'
import Payments from './pages/payments/Payments'
import History from './pages/history/History'
import { VideoModal } from './components/modal/VideoModal'
import AddCard from './pages/Cart/AddCard'
import Users from './pages/users/Users'
import BuyModal from './components/modal/BuyModal'
import PromoCode from './pages/promocode/PromoCode'
import Status from './pages/Status/Status'
import SuperUsers from './pages/SuperUsers/SuperUsers'
import TextModal from './components/modal/TextModal'
import Statistics from './pages/statistics/Statistics'
import Booking from './pages/booking/SelectBooking'
import Donation from './pages/donation/Donation'
import Balance from './pages/balance/Balance'
import TransactionsLog from './pages/transactionsLog/TransactionsLog'
import PasswordManager from './pages/users/PasswordManager'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/statistics' element={<Statistics />} />
				<Route path='/donation' element={<Donation />} />
				<Route path='/promocode' element={<PromoCode />} />
				<Route path='/register' element={<Register />} />
				<Route
					path='/users'
					element={
						<ProtectedAdminRoute>
							<Users />
						</ProtectedAdminRoute>
					}
				/>
				<Route path='/booking' element={<Booking />} />
				<Route path='/status/:gameId/:order' element={<Status />} />
				<Route
					path='/users/:userId'
					element={
						<ProtectedAdminRoute>
							<History />
						</ProtectedAdminRoute>
					}
				/>
				<Route path='/profile' element={<Profile />} />
				<Route path='/wallet' element={<Wallet />} />
				<Route path='add-card' element={<AddCard />} />
				<Route
					path='/superusers'
					element={
						<ProtectedAdminRoute>
							<SuperUsers />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path='/payments'
					element={
						<ProtectedAdminRoute>
							<Payments />
						</ProtectedAdminRoute>
					}
				/>
				<Route path='/about' element={<About />} />
				<Route path='/announcements' element={<Announcements />} />
				<Route
					path='/announcements/:announcementsId'
					element={<Announcements />}
				/>
				<Route path='/cart' element={<Cart />} />
				<Route path='/history' element={<History />} />
				<Route
					path='/balance'
					element={
						<ProtectedAdminRoute>
							<Balance />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path='/transactions-log'
					element={
						<ProtectedAdminRoute>
							<TransactionsLog />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path='/:gameName/:gameId'
					element={
						<>
							<GamePage />
							<OfferModal />
						</>
					}
				/>
				<Route
					path='/password-manager'
					element={
						<ProtectedAdminRoute>
							<PasswordManager />
						</ProtectedAdminRoute>
					}
				/>
				<Route path='*' element={<ErrorPage />} />
			</Routes>
			<GameModal />
			<VideoModal />
			<BuyModal />
			<TextModal />
		</>
	)
}

export default App
