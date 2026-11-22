import { ActionIcon, Avatar, Box, Text, Tooltip } from '@mantine/core';
import { Icon } from './icons';

// Avatar colors, hashed from the company name. Red and yellow stay out: they belong to problems.
const avatarColors = ['blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'grape', 'violet', 'indigo'];

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
			name={base}
			color="initials"
			allowedInitialsColors={avatarColors}
			variant="filled"
			style={{ flexShrink: 0 }}
			aria-hidden
		>
			<Text size="xs" fw={500} c="inherit">
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
