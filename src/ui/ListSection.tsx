import { Fragment, type ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';

/**
 * List card: title + count (or a custom `header`, or none), rows separated by dividers.
 * `prepend` adds extra rows above the list (counted via `extraCount`).
 */
export function ListSection<T>({
	title,
	header,
	items,
	getKey,
	renderItem,
	empty,
	prepend,
	extraCount = 0,
	actions,
}: {
	title?: ReactNode;
	header?: ReactNode;
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T) => ReactNode;
	empty?: ReactNode;
	prepend?: ReactNode[];
	extraCount?: number;
	actions?: ReactNode;
}) {
	const head = prepend ?? [];
	const hasHeader = Boolean(title || header || actions);
	return (
		// Same 16px inset as the Settings cards. Rows bring 12px of their own, so without a header the card adds 4.
		<Paper px="md" pt={hasHeader ? 'md' : 4} pb={4}>
			{hasHeader && (
				<Group justify="space-between" mb={8}>
					{header ?? (
						<Group gap={8} align="baseline">
							<Title order={2}>{title}</Title>
							<Text c="dimmed" className="tnum">
								{items.length + extraCount}
							</Text>
						</Group>
					)}
					{actions}
				</Group>
			)}
			{head.map((node, i) => (
				<Fragment key={i}>
					{i > 0 && <Divider />}
					{node}
				</Fragment>
			))}
			{head.length > 0 && items.length > 0 && <Divider />}
			{items.length === 0 ? (
				head.length === 0 && empty ? (
					<Text c="dimmed" py={12}>
						{empty}
					</Text>
				) : null
			) : (
				<Stack gap={0}>
					{items.map((item, i) => (
						<Box key={getKey(item)}>
							{i > 0 && <Divider />}
							{renderItem(item)}
						</Box>
					))}
				</Stack>
			)}
		</Paper>
	);
}
