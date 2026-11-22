import type { ReactNode } from 'react';
import { Group, Title, UnstyledButton } from '@mantine/core';

/** The j mark from public/favicon.svg, inline so the stem follows the app color scheme; the dot stays orange. */
function Logo() {
	return (
		<svg width={36} height={36} viewBox="0 0 256 256" aria-hidden>
			<g transform="translate(-14 -17.38) scale(1.127)">
				<path
					fill="var(--mantine-color-text)"
					d="M182 110V160A78 78 0 0 1 104 238H88A22 22 0 0 1 88 194H104A34 34 0 0 0 138 160V110A22 22 0 0 1 182 110Z"
				/>
				<circle cx="160" cy="46" r="26" fill="var(--mantine-color-orange-6)" />
			</g>
		</svg>
	);
}

/** Logo + title on the left (clickable with onHome: back to the main screen), actions on the right. */
export function AppHeader({ title, actions, onHome }: { title: ReactNode; actions?: ReactNode; onHome?: () => void }) {
	const brand = (
		<Group gap="xs" wrap="nowrap" miw={0}>
			<Logo />
			<Title order={1}>{title}</Title>
		</Group>
	);
	return (
		<Group justify="space-between" gap="sm">
			{onHome ? <UnstyledButton onClick={onHome}>{brand}</UnstyledButton> : brand}
			<Group gap={8}>{actions}</Group>
		</Group>
	);
}
