import { Box, Group, UnstyledButton } from '@mantine/core';

export interface PipelineItem<T extends string> {
	value: T;
	label: string;
	count: number;
	/** Part of the funnel bar under the tabs. Items without a tone (like To apply) only show their count. */
	tone?: 'early' | 'mid' | 'goal' | 'closed';
}

/** Plain text tabs: label plus a mono count, the open one with an accent underline. */
export function PipelineTabs<T extends string>({
	value,
	onChange,
	items,
	label,
}: {
	value: T;
	onChange: (v: T) => void;
	items: PipelineItem<T>[];
	label: string;
}) {
	const move = (dir: number) => {
		const i = items.findIndex((x) => x.value === value);
		const next = items[(i + dir + items.length) % items.length]!;
		onChange(next.value);
		document.getElementById(`tab-${next.value}`)?.focus();
	};
	return (
		<Box className="pipeline" miw={0}>
			{/* On a phone the tabs scroll sideways inside this box, never the page. */}
			<Group gap={20} role="tablist" aria-label={label} wrap="nowrap" className="pipeline-tabs">
				{items.map((x) => (
					<UnstyledButton
						key={x.value}
						id={`tab-${x.value}`}
						role="tab"
						aria-selected={x.value === value}
						tabIndex={x.value === value ? 0 : -1}
						className="list-tab"
						onClick={() => onChange(x.value)}
						onKeyDown={(e) => {
							if (e.key === 'ArrowRight') move(1);
							if (e.key === 'ArrowLeft') move(-1);
						}}
					>
						{x.label}
						<span className="meta">{x.count}</span>
					</UnstyledButton>
				))}
			</Group>
		</Box>
	);
}

/**
 * One thin bar across the list that splits the sent jobs by stage. The tabs above are its legend, so it has no
 * labels of its own. Hidden until something was sent.
 */
export function PipelineBar<T extends string>({ items, label }: { items: PipelineItem<T>[]; label: string }) {
	const funnel = items.filter((x) => x.tone && x.count > 0);
	if (funnel.length === 0) return null;
	return (
		<div className="pipeline-bar" role="img" aria-label={label}>
			{funnel.map((x) => (
				<span key={x.value} className="pipeline-seg" data-tone={x.tone} style={{ flexGrow: x.count }} />
			))}
		</div>
	);
}
