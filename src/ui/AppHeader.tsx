import type { ReactNode } from 'react';
import { Group, Title, UnstyledButton } from '@mantine/core';

/** Logo + title on the left (clickable with onHome: back to the main screen), actions on the right. */
export function AppHeader({ title, actions, onHome }: { title: ReactNode; actions?: ReactNode; onHome?: () => void }) {
	const brand = (
		<Group gap="xs" wrap="nowrap" miw={0}>
			<img src="/favicon.svg" alt="" width={36} height={36} />
			<Title order={1}>{title}</Title>
		</Group>
	);
	return (
		<Group justify="space-between" gap="sm">
			{onHome ? <UnstyledButton onClick={onHome}>{brand}</UnstyledButton> : brand}
			<Group gap={10}>{actions}</Group>
		</Group>
	);
}
