import { Navigate } from 'react-router-dom'
import { useIsAdmin } from '../hooks/useIsAdmin'

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAdmin, isLoading, isSuccess } = useIsAdmin()

	if (isLoading || !isSuccess) return null

	if (!isAdmin) return <Navigate to='/' replace />

	return <>{children}</>
}

export default ProtectedAdminRoute
