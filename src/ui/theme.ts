import { createTheme, rem } from '@mantine/core';

// Calm look: one accent color (orange, from the logo dot), gray surfaces, 15 px body text.
// IBM Plex Sans for the interface, Plex Mono for counts, dates and other meta.
// Red and yellow only for problems.
export const theme = createTheme({
	primaryColor: 'orange',
	primaryShade: { light: 7, dark: 5 },
	// Filled accents always carry white text, whatever the color (no autoContrast).
	colors: {
		// Mantine's orange, with shades 7–9 darkened so accent text and white-on-accent reach 4.5:1 on white.
		// 6 stays the logo dot.
		orange: [
			'#fff4e6',
			'#ffe8cc',
			'#ffd8a8',
			'#ffc078',
			'#ffa94d',
			'#ff922b',
			'#fd7e14',
			'#c2410c',
			'#a63a0b',
			'#8a300a',
		],
		// Dark mode: near-black page (9), cards one step up (7), muted borders (4). Depth from steps, not shadows.
		dark: [
			'#d4d8de',
			'#a8aeb8',
			'#7c838f',
			'#5a606b',
			'#2b2f36',
			'#1f2228',
			'#1a1c21',
			'#131418',
			'#0e0f12',
			'#0a0b0d',
		],
	},
	defaultRadius: 'md',
	cursorType: 'pointer',
	fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
	fontFamilyMonospace: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
	fontSizes: { xs: rem(13), sm: rem(14), md: rem(15), lg: rem(17), xl: rem(20) },
	headings: {
		fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
		fontWeight: '500',
		sizes: { h1: { fontSize: rem(20) }, h2: { fontSize: rem(16) }, h3: { fontSize: rem(14) } },
	},
	components: {
		// Only 400 and 500 are bundled, so buttons drop Mantine's 600 instead of getting a faux bold.
		Button: { styles: { root: { fontWeight: 500 } } },
		Paper: { defaultProps: { withBorder: true, radius: 'lg' } },
		SegmentedControl: { defaultProps: { radius: 'lg', size: 'sm' } },
		Tooltip: {
			defaultProps: { multiline: true, maw: 260, openDelay: 150, events: { hover: true, focus: true, touch: false } },
		},
	},
});
