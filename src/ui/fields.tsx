import { useEffect, useState } from 'react';
import { ActionIcon, Avatar, Button, Text, Tooltip } from '@mantine/core';
import { Icon } from './icons';

/** Company initials avatar. */
export function CompanyAvatar({ name }: { name: string }) {
	const initials =
		name
			.replace(/\s+(a\.s\.|s\.r\.o\.|spol\..*|gmbh|ltd\.?|inc\.?)$/i, '')
			.split(/[\s,]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]!.toUpperCase())
			.join('') || '?';
	return (
		<Avatar size={32} radius="xl" color="blue" variant="light" aria-hidden>
			<Text size="xs" fw={600} c="inherit">
				{initials}
			</Text>
		</Avatar>
	);
}

/** Opens a prefilled application e-mail. */
export function MailButton({ href, label }: { href: string; label: string }) {
	return (
		<Tooltip label={label}>
			<ActionIcon component="a" href={href} variant="default" color="gray" size="lg" aria-label={label}>
				<Icon name="mail" />
			</ActionIcon>
		</Tooltip>
	);
}

export function LinkButton({ href, label = 'Open job posting' }: { href: string; label?: string }) {
	return (
		<Tooltip label={label}>
			<ActionIcon
				component="a"
				href={href}
				target="_blank"
				rel="noreferrer"
				variant="default"
				color="gray"
				size="lg"
				aria-label={label}
			>
				<Icon name="link" />
			</ActionIcon>
		</Tooltip>
	);
}

const deleteLabels = { tooltip: 'Not a fit (remove)', confirm: 'Remove?', aria: 'Remove' };

// Double click instead of a confirm dialog.
export function DeleteButton({
	onConfirm,
	labels = deleteLabels,
}: {
	onConfirm: () => void;
	labels?: typeof deleteLabels;
}) {
	const [armed, setArmed] = useState(false);
	useEffect(() => {
		if (!armed) return;
		const t = setTimeout(() => setArmed(false), 2500);
		return () => clearTimeout(t);
	}, [armed]);
	return armed ? (
		<Button size="compact-xs" color="red" variant="light" onClick={onConfirm}>
			{labels.confirm}
		</Button>
	) : (
		<Tooltip label={labels.tooltip}>
			<ActionIcon variant="default" color="gray" size="lg" aria-label={labels.aria} onClick={() => setArmed(true)}>
				<Icon name="x" />
			</ActionIcon>
		</Tooltip>
	);
}
