export function toMinutes(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number
) {
	return new Date(year, month - 1, day, hour, minute).getTime() / 60000
}
