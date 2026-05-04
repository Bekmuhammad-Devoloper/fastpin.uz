export function getStatusLabel(status: string, t: any): string {
	switch (status) {
		case 'Completed':
			return t.Completed
		case 'In progress':
			return t.in_progress
		case 'Pending':
			return t.pending
		case 'Partial':
			return t.partial
		case 'Canceled':
			return t.canceled
		case 'Refunded':
			return t.Refunded
		default:
			return status
	}
}

export interface IStatsItem {
	total: number
	count: number
}
export function formatCurrency(num: number): string {
	return Math.abs(num).toLocaleString('ru-RU') + ' сум'
}

export function getStatusColor(status: string): string {
	switch (status) {
		case 'Completed':
			return '#2ecc71'
		case 'In progress':
			return '#3498db'
		case 'Pending':
			return '#f39c12'
		case 'Partial':
			return '#9b59b6'
		case 'Canceled':
			return '#e74c3c'
		case 'Refunded':
			return '#e67e22'
		default:
			return '#95a5a6'
	}
}
