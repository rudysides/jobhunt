import { Fragment, type ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';

/**
 * List card: title + count, rows separated by dividers.
 * `prepend` adds extra rows above the list (counted via `extraCount`).
 */
export function ListSection<T>({
	title,
	items,
	getKey,
	renderItem,
	empty,
	prepend,
	extraCount = 0,
	actions,
}: {
	title: ReactNode;
	items: T[];
	getKey: (item: T) => string;
	renderItem: (item: T) => ReactNode;
	empty?: ReactNode;
	prepend?: ReactNode[];
	extraCount?: number;
	actions?: ReactNode;
}) {
	const head = prepend ?? [];
	return (
		<Paper p="md" px="lg">
			<Group justify="space-between" mb={4}>
				<Group gap={8} align="baseline">
					<Title order={2}>{title}</Title>
					<Text c="dimmed" className="tnum">
						{items.length + extraCount}
					</Text>
				</Group>
				{actions}
			</Group>
			{head.map((node, i) => (
				<Fragment key={i}>
					{i > 0 && <Divider />}
					{node}
				</Fragment>
			))}
			{head.length > 0 && items.length > 0 && <Divider />}
			{items.length === 0 ? (
				head.length === 0 && empty ? (
					<Text c="dimmed" py="md">
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
