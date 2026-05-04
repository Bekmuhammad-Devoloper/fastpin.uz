import '@mui/material/styles'
declare module '@mui/material/styles' {
	interface Palette {
		custom: {
			neonPurple: string
			neonOrange: string
			neonCyan: string
			neonGreen: string
			gradientStart: string
			gradientEnd: string
		}
	}

	interface PaletteOptions {
		custom?: {
			neonPurple?: string
			neonOrange?: string
			neonCyan?: string
			neonGreen?: string
			gradientStart?: string
			gradientEnd?: string
			
		}
	}
}
