// Small monochrome icons (16 px, 1.5 stroke) drawn in the text color.
const paths = {
	clock: 'M8 4.5V8l2.5 1.5M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z',
	calendar: 'M2.5 5.5h11M5 1.5v2M11 1.5v2M3.5 3h9a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
	calendarOff:
		'M2.5 5.5h11M5 1.5v2M11 1.5v2M3.5 3h9a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM6.5 8.5l3 3M9.5 8.5l-3 3',
	mail: 'M2 4h12v8H2zM2 4.5l6 4.5 6-4.5',
	send: 'M14 2L7 9M14 2l-4.5 12L7 9 2 6.5z',
	plus: 'M8 3v10M3 8h10',
	download: 'M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10',
	upload: 'M8 10.5v-8M4.5 6L8 2.5 11.5 6M3 13.5h10',
	x: 'M4 4l8 8M12 4l-8 8',
	link: 'M9.5 2.5h4v4M13.5 2.5L7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3',
	search: 'M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zM10.5 10.5L14 14',
	sliders: 'M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6M10 3v3M6 10v3',
	laptop: 'M3.5 3.5h9a1 1 0 0 1 1 1v6h-11v-6a1 1 0 0 1 1-1zM1.5 12.5h13',
	check: 'M3 8.5l3 3 7-7',
	pin: 'M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14zM8 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
	copy: 'M5.5 5.5h7v8h-7zM3.5 10.5v-8h7',
	briefcase: 'M5.5 4.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M2.5 4.5h11v8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1zM2.5 8.5h11',
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d={paths[name]} />
		</svg>
	);
}
