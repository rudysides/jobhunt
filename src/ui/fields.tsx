import { ActionIcon, Avatar, Box, Text, Tooltip } from '@mantine/core';
import { Icon } from './icons';

// Avatar colors, hashed from the company name. All dark enough for white initials (at least 4.5:1 contrast)
// in both color schemes. Red and yellow stay out: they belong to problems.
const avatarColors = [
	'#1971c2', // blue
	'#0b7285', // cyan
	'#087f5b', // teal
	'#237032', // green
	'#c2410c', // orange
	'#c2255c', // pink
	'#9c36b5', // grape
	'#6741d9', // violet
	'#3b5bdb', // indigo
];

function avatarColor(name: string) {
	let hash = 0;
	for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
	return avatarColors[Math.abs(hash) % avatarColors.length];
}

/** Company initials avatar, the color stays the same for the same company. */
export function CompanyAvatar({ name }: { name: string }) {
	const base = name.replace(/\s+(a\.s\.|s\.r\.o\.|spol\..*|gmbh|ltd\.?|inc\.?)$/i, '');
	const initials =
		base
			.split(/[\s,]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]!.toUpperCase())
			.join('') || '?';
	return (
		<Avatar
			size={32}
			radius="xl"
			color={avatarColor(base)}
			variant="filled"
			autoContrast={false}
			style={{ flexShrink: 0 }}
			aria-hidden
		>
			<Text size="xs" fw={500} c="white">
				{initials}
			</Text>
		</Avatar>
	);
}

/**
 * Fit score as five pencil ticks. Only a perfect fit gets the accent, everything else stays neutral,
 * so the best leads stand out in a list where most rows score 4.
 */
export function FitTicks({ fit, label }: { fit: number; label: string }) {
	const on = fit >= 5 ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-dimmed)';
	return (
		<Box component="span" role="img" aria-label={label} title={label} display="inline-flex" style={{ gap: 2 }}>
			{[1, 2, 3, 4, 5].map((i) => (
				<Box
					key={i}
					component="span"
					w={3}
					h={12}
					bg={i <= fit ? on : 'var(--mantine-color-default-border)'}
					style={{ borderRadius: 2 }}
				/>
			))}
		</Box>
	);
}

/** Opens a prefilled application e-mail. */
export function MailButton({ href, label }: { href: string; label: string }) {
	return (
		<Tooltip label={label}>
			<ActionIcon
				component="a"
				href={href}
				variant="default"
				color="gray"
				className="hover-accent"
				size="lg"
				aria-label={label}
			>
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
				className="hover-accent"
				size="lg"
				aria-label={label}
			>
				<Icon name="link" />
			</ActionIcon>
		</Tooltip>
	);
}

/** Opens the user's own note for a row (accent icon once a note exists). While editing it turns into a save check. */
export function NoteButton({
	active,
	editing,
	label,
	onClick,
}: {
	active: boolean;
	editing: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<Tooltip label={label}>
			<ActionIcon
				variant="default"
				color="gray"
				c={active && !editing ? 'var(--mantine-primary-color-filled)' : undefined}
				className={editing ? 'hover-success' : 'hover-accent'}
				size="lg"
				aria-label={label}
				// Keeps focus in an open note, so a click saves it instead of blurring and reopening.
				onMouseDown={(e) => e.preventDefault()}
				onClick={onClick}
			>
				<Icon name={editing ? 'check' : 'note'} />
			</ActionIcon>
		</Tooltip>
	);
}

const deleteLabels = { tooltip: 'Not a fit, remove', aria: 'Remove' };

// Removes right away, the caller offers undo in a toast instead of asking first.
export function DeleteButton({
	onRemove,
	labels = deleteLabels,
}: {
	onRemove: () => void;
	labels?: typeof deleteLabels;
}) {
	return (
		<Tooltip label={labels.tooltip}>
			<ActionIcon
				variant="default"
				color="gray"
				className="hover-danger"
				size="lg"
				aria-label={labels.aria}
				onClick={onRemove}
			>
				<Icon name="x" />
			</ActionIcon>
		</Tooltip>
	);
}
