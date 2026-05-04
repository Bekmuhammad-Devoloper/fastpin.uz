import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useThemeStore } from '../src/store/theme/theme.ts'
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
function Main() {
	const { theme } = useThemeStore()
	const muiTheme = useMemo(() => {
		const isDark = theme === 'dark'
		return createTheme({
			palette: {
				mode: isDark ? 'dark' : 'light',
				background: {
					default: isDark ? '#0A0E17' : '#F0F4FF',
					paper: isDark ? '#121822' : '#FFFFFF',
				},
				primary: {
					main: isDark ? '#00D4FF' : '#007BFF',
					light: isDark ? '#4DEFFF' : '#4D9CFF',
					dark: isDark ? '#0095CC' : '#0056B3',
					contrastText: '#FFFFFF',
				},
				secondary: {
					main: isDark ? '#FF2E63' : '#E91E63',
					light: isDark ? '#FF5F8A' : '#F06292',
					dark: isDark ? '#C70039' : '#C2185B',
					contrastText: '#FFFFFF',
				},
				success: {
					main: isDark ? '#00FF9F' : '#00C853',
				},
				error: {
					main: isDark ? '#FF3D71' : '#D81B60',
				},
				warning: {
					main: isDark ? '#FFD700' : '#FFAB00',
				},
				info: {
					main: isDark ? '#00E5FF' : '#00B8D4',
				},
				custom: {
					neonPurple: isDark ? '#BB00FF' : '#7C4DFF',
					neonOrange: isDark ? '#FF6B00' : '#FF5722',
					neonCyan: isDark ? '#00F5FF' : '#00E5FF',
					gradientStart: isDark ? '#0f0c29' : '#8e9ee0',
					neonGreen: isDark ? '#302b63' : '#9496a2',
					gradientEnd: isDark ? '#24243e' : '#bcc2d5',
				},
				text: {
					primary: isDark ? '#E0F7FF' : '#0F172A',
					secondary: isDark ? '#B0BEC5' : '#475569',
					disabled: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
				},
				divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
				action: {
					hover: isDark
						? 'rgba(0, 212, 255, 0.12)'
						: 'rgba(59, 130, 246, 0.12)',
					selected: isDark
						? 'rgba(0, 212, 255, 0.16)'
						: 'rgba(59, 130, 246, 0.16)',
				},
			},
			shape: {
				borderRadius: 12,
			},
			typography: {
				fontFamily: '"Roboto", "Inter", "Arial", sans-serif',
				h1: {
					fontWeight: 800,
					fontFamily: '"Playwrite IN Guides", cursive',
				},
				h2: {
					fontWeight: 700,
					fontFamily: '"Playwrite IN Guides", cursive',
				},
				button: {
					fontWeight: 600,
					letterSpacing: '0.02em',
				},
			},
			components: {
				MuiCssBaseline: {
					styleOverrides: `
						body {
							transition: background-color 0.3s ease, color 0.3s ease;
						}
						@property --angle {
							syntax: '<angle>';
							initial-value: 0deg;
							inherits: false;
						}
						@keyframes rotateBorder {
							from { --angle: 0deg; }
							to { --angle: 360deg; }
						}
					`,
				},
				MuiButton: {
					styleOverrides: {
						root: {
							borderRadius: 12,
							textTransform: 'none',
							fontWeight: 600,
							transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
						},
						contained: {
							boxShadow: isDark
								? '0 4px 14px rgba(0, 212, 255, 0.25)'
								: '0 4px 14px rgba(0, 123, 255, 0.25)',
							'&:hover': {
								transform: 'translateY(-1px)',
								boxShadow: isDark
									? '0 6px 20px rgba(0, 212, 255, 0.35)'
									: '0 6px 20px rgba(0, 123, 255, 0.35)',
							},
							'&:active': {
								transform: 'translateY(0)',
							},
						},
						outlined: {
							borderWidth: '1.5px',
							'&:hover': {
								borderWidth: '1.5px',
							},
						},
					},
				},
				MuiCard: {
					styleOverrides: {
						root: {
							borderRadius: 16,
							transition: 'transform 0.25s ease, box-shadow 0.25s ease',
						},
					},
				},
				MuiPaper: {
					styleOverrides: {
						root: {
							backgroundImage: 'none',
						},
					},
				},
				MuiTextField: {
					styleOverrides: {
						root: {
							'& .MuiOutlinedInput-root': {
								borderRadius: 12,
								transition: 'box-shadow 0.2s ease',
								'&.Mui-focused': {
									boxShadow: isDark
										? '0 0 0 3px rgba(0, 212, 255, 0.15)'
										: '0 0 0 3px rgba(0, 123, 255, 0.15)',
								},
							},
						},
					},
				},
				MuiDialog: {
					styleOverrides: {
						paper: {
							borderRadius: 20,
							backgroundImage: 'none',
						},
					},
				},
				MuiTableCell: {
					styleOverrides: {
						root: {
							borderColor: isDark
								? 'rgba(255,255,255,0.06)'
								: 'rgba(0,0,0,0.06)',
						},
						head: {
							fontWeight: 700,
							fontSize: '0.8rem',
							textTransform: 'uppercase',
							letterSpacing: '0.05em',
							color: isDark ? '#B0BEC5' : '#475569',
						},
					},
				},
				MuiTableRow: {
					styleOverrides: {
						root: {
							transition: 'background-color 0.15s ease',
							'&:hover': {
								backgroundColor: isDark
									? 'rgba(0, 212, 255, 0.04)'
									: 'rgba(0, 123, 255, 0.04)',
							},
						},
					},
				},
				MuiChip: {
					styleOverrides: {
						root: {
							fontWeight: 500,
						},
					},
				},
				MuiAccordion: {
					styleOverrides: {
						root: {
							borderRadius: '16px !important',
							'&:before': {
								display: 'none',
							},
							overflow: 'hidden',
						},
					},
				},
				MuiDrawer: {
					styleOverrides: {
						paper: {
							borderRadius: '0 24px 24px 0',
						},
					},
				},
				MuiBottomNavigation: {
					styleOverrides: {
						root: {
							height: 64,
						},
					},
				},
				MuiBottomNavigationAction: {
					styleOverrides: {
						root: {
							transition: 'all 0.2s ease',
							minWidth: 60,
							'&.Mui-selected': {
								transform: 'translateY(-2px)',
							},
						},
					},
				},
				MuiSkeleton: {
					styleOverrides: {
						root: {
							borderRadius: 12,
						},
					},
				},
			},
		})
	}, [theme])
	const queryClient = new QueryClient()
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={muiTheme}>
				<CssBaseline />
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

createRoot(document.getElementById('root')!).render(<Main />)
