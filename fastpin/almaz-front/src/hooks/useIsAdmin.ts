import { useQuery } from '@tanstack/react-query'
import api from '../api/api'
import { useTokenStore } from '../store/token/useTokenStore'

export const useIsAdmin = () => {
	const { token, setUserRole, setBalance } = useTokenStore()

	const { data, isLoading, isSuccess } = useQuery({
		queryKey: ['userRole', token],
		queryFn: async () => {
			const result = await api.post('/users/getUserById', { userId: token })
			const user = result.data

			const role: string = user.userRole ?? ''
			const balance = user.balance ?? 0

			if (role) setUserRole(role)
			setBalance(String(balance))

			return role
		},
		enabled: !!token,
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		retry: 1,
	})

	return {
		isAdmin: isSuccess && data === 'admin',
		isLoading,
		isSuccess,
	}
}
