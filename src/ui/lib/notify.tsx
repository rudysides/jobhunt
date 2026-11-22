import { Box, Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Icon } from '../icons';

export const say = (message: string, color?: string) =>
	notifications.show({
		message,
		color,
		className: color === 'red' ? 'toast-danger' : undefined,
		withCloseButton: false,
	});

/** Removal toast: red x, message and an undo button, open a bit longer than a plain one so there's time to click. */
export function sayWithUndo(message: string, undoLabel: string, onUndo: () => void) {
	const id = notifications.show({
		withCloseButton: false,
		autoClose: 6000,
		message: (
			<Group justify="space-between" wrap="nowrap" gap={12}>
				<Group gap={8} wrap="nowrap" miw={0}>
					<Box c="red" display="flex" style={{ flexShrink: 0 }}>
						<Icon name="x" />
					</Box>
					<Text size="sm" truncate>
						{message}
					</Text>
				</Group>
				<Button
					size="compact-sm"
					variant="default"
					onClick={() => {
						onUndo();
						notifications.hide(id);
					}}
				>
					{undoLabel}
				</Button>
			</Group>
		),
	});
}
