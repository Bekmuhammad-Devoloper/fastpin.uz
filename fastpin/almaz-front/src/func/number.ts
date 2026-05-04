export function updateNumberFormat(sum: number | string) {
	return new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 2,
	}).format(Number(sum))
}
