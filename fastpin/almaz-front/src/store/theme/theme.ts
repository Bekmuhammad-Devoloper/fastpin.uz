import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
	theme: Theme
	toggleTheme: () => void
	setTheme: (theme: Theme) => void
}

const getInitialTheme = (): Theme => {
	const storedTheme = localStorage.getItem('theme')
	if (storedTheme === 'light' || storedTheme === 'dark') {
		return storedTheme
	}

	const prefersDark = window.matchMedia?.(
		'(prefers-color-scheme: dark)',
	).matches
	return prefersDark ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeStore>(set => ({
	theme: getInitialTheme(),
	toggleTheme: () =>
		set(state => {
			const newTheme = state.theme === 'light' ? 'dark' : 'light'
			localStorage.setItem('theme', newTheme)
			return { theme: newTheme }
		}),
	setTheme: (theme: Theme) => {
		localStorage.setItem('theme', theme)
		set({ theme })
	},
}))
