import { createTheme, rem } from '@mantine/core';

// Calm look: one accent color (blue), gray surfaces, 15 px body text.
// Red and yellow only for problems.
export const theme = createTheme({
	primaryColor: 'blue',
	primaryShade: { light: 7, dark: 5 },
	// Filled accents always carry white text, whatever the color (no autoContrast).
	colors: {
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
	fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
	fontSizes: { xs: rem(13), sm: rem(14), md: rem(15), lg: rem(17), xl: rem(20) },
	headings: {
		fontWeight: '500',
		sizes: { h1: { fontSize: rem(20) }, h2: { fontSize: rem(16) }, h3: { fontSize: rem(14) } },
	},
	components: {
		Paper: { defaultProps: { withBorder: true, radius: 'lg' } },
		SegmentedControl: { defaultProps: { radius: 'lg', size: 'sm' } },
		Tooltip: {
			defaultProps: { multiline: true, maw: 260, openDelay: 150, events: { hover: true, focus: true, touch: false } },
		},
	},
});
