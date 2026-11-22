import { createTheme, rem } from '@mantine/core';

// Calm look: one accent color (blue), gray surfaces, 14 px density.
// Red and yellow only for problems.
export const theme = createTheme({
	primaryColor: 'blue',
	primaryShade: { light: 7, dark: 5 },
	// Light accents (orange, cyan) get dark text so it stays readable.
	autoContrast: true,
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
	fontSizes: { xs: rem(12), sm: rem(13), md: rem(14), lg: rem(16), xl: rem(20) },
	headings: {
		fontWeight: '500',
		sizes: { h1: { fontSize: rem(20) }, h2: { fontSize: rem(15) }, h3: { fontSize: rem(13) } },
	},
	components: {
		Paper: { defaultProps: { withBorder: true, radius: 'lg' } },
		SegmentedControl: { defaultProps: { radius: 'lg', size: 'sm' } },
		Tooltip: {
			defaultProps: { multiline: true, maw: 260, openDelay: 150, events: { hover: true, focus: true, touch: false } },
		},
	},
});
