import { create } from 'zustand'
import ru from './ru'
import uz from './uz'

type TranslationContent = typeof ru

interface TranslationState {
	lang: 'uz' | 'ru'
	setLang: (lang: 'uz' | 'ru') => void
	t: TranslationContent
}

const translations: Record<'uz' | 'ru', TranslationContent> = {
	uz,
	ru,
}

export const useTranslationStore = create<TranslationState>(set => {
	const storedLang = localStorage.getItem('lang')
	const langFromStorage = storedLang === 'ru' ? storedLang : 'uz'
	return {
		lang: langFromStorage,
		t: translations[langFromStorage],
		setLang: (lang: 'uz' | 'ru') => {
			localStorage.setItem('lang', lang)
			set({
				lang,
				t: translations[lang],
			})
		},
	}
})
