/*
 * Settings: profile summary, appearance (theme + accent), language and data (backup, import, delete all).
 * The profile itself is edited with /setup in Claude Code; the app only shows it.
 * Mantine remembers the color scheme itself (localStorage), the accent lives in ui/accent.tsx.
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
	Badge,
	Button,
	Code,
	ColorSwatch,
	FileButton,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Title,
	UnstyledButton,
	useMantineColorScheme,
	type MantineColorScheme,
} from '@mantine/core';
import { Icon, accents, downloadJson, readBackupFile, say, useAccent, type IconName } from './ui';
import { profile } from './profile';
import { normalizeRow, useJobs, type JobRow } from './store';
import { languages, locale, setLocale, t } from './i18n';

const tp = t.settings;

// Profile summary as icon pills: target roles, locations, remote mode.
const pills: { key: string; icon: IconName; label: string }[] = profile
	? [
			...profile.targetRoles.map((r) => ({ key: `r-${r}`, icon: 'briefcase' as const, label: r })),
			...profile.locations.map((l) => ({ key: `l-${l}`, icon: 'pin' as const, label: l })),
			{ key: 'remote', icon: 'laptop', label: tp.remote[profile.remote] },
		]
	: [];

function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
	return (
		<Paper p="md">
			<Stack gap="sm">
				<Title order={2}>{title}</Title>
				{hint && (
					<Text size="sm" c="dimmed">
						{hint}
					</Text>
				)}
				{children}
			</Stack>
		</Paper>
	);
}

// A command chip that copies itself on click.
function CopyCode({ command }: { command: string }) {
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(command);
			say(tp.copied(command));
		} catch {
			say(tp.copyFail, 'red');
		}
	};
	return (
		<UnstyledButton title={tp.copyCommand} aria-label={`${tp.copyCommand}: ${command}`} onClick={copy}>
			<Code className="copy-code">
				{command}
				<Icon name="copy" size={12} />
			</Code>
		</UnstyledButton>
	);
}

export function Settings({ onClose }: { onClose: () => void }) {
	const { rows, dismissedLeads, replaceAll, clearAll } = useJobs();
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const { accent, setAccent } = useAccent();
	const [armed, setArmed] = useState(false);
	// A checked backup waiting for the user to confirm that it replaces the current list.
	const [pending, setPending] = useState<{ rows: JobRow[]; dismissedLeads?: string[] } | null>(null);

	// The delete confirmation turns itself off after a while.
	useEffect(() => {
		if (!armed) return;
		const id = setTimeout(() => setArmed(false), 4000);
		return () => clearTimeout(id);
	}, [armed]);

	const importJson = async (file: File | null) => {
		if (!file) return;
		try {
			setPending(await readBackupFile(file, normalizeRow));
		} catch (e) {
			say(t.importFail((e as Error).message), 'red');
		}
	};

	const confirmImport = () => {
		if (!pending) return;
		replaceAll(pending.rows, pending.dismissedLeads);
		say(t.importOk(pending.rows.length));
		setPending(null);
	};

	const deleteAll = () => {
		const n = rows.length;
		clearAll();
		setArmed(false);
		say(tp.deletedAll(n));
	};

	const schemes: [MantineColorScheme, string][] = [
		['light', tp.light],
		['dark', tp.dark],
		['auto', tp.system],
	];

	return (
		<Stack gap="md">
			<Group justify="space-between">
				<Title order={2} fz="xl">
					{tp.title}
				</Title>
				<Button variant="default" size="xs" onClick={onClose}>
					{tp.back}
				</Button>
			</Group>

			<Section
				title={tp.profile}
				hint={
					<>
						{profile ? tp.profileHint : tp.noProfile} <CopyCode command="/setup" />
					</>
				}
			>
				{profile && (
					<Text size="sm" fw={500}>
						{profile.name} · {profile.headline}
					</Text>
				)}
				{pills.length > 0 && (
					<Group gap={8}>
						{pills.map((p) => (
							<Badge key={p.key} variant="default" tt="none" leftSection={<Icon name={p.icon} size={14} />}>
								{p.label}
							</Badge>
						))}
					</Group>
				)}
			</Section>

			<Section title={tp.appearance}>
				<Group gap="xs">
					{schemes.map(([value, label]) => (
						<Button
							key={value}
							size="xs"
							variant={colorScheme === value ? 'filled' : 'default'}
							aria-pressed={colorScheme === value}
							onClick={() => setColorScheme(value)}
						>
							{label}
						</Button>
					))}
				</Group>
				<Stack gap={6}>
					<Text size="sm" c="dimmed">
						{tp.accent}
					</Text>
					<Group gap="xs" role="radiogroup" aria-label={tp.accent}>
						{accents.map((a) => (
							<ColorSwatch
								key={a}
								component="button"
								type="button"
								role="radio"
								aria-checked={accent === a}
								aria-label={tp.accents[a]}
								title={tp.accents[a]}
								color={`var(--mantine-color-${a}-6)`}
								size={26}
								c="white"
								style={{ cursor: 'pointer' }}
								onClick={() => setAccent(a)}
							>
								{accent === a && <Icon name="check" size={14} />}
							</ColorSwatch>
						))}
					</Group>
				</Stack>
			</Section>

			<Section title={tp.language}>
				<Select
					aria-label={tp.language}
					data={languages.map((l) => ({ value: l.code, label: l.label }))}
					value={locale}
					onChange={(v) => v && v !== locale && setLocale(v)}
					allowDeselect={false}
					checkIconPosition="right"
					w={220}
					size="xs"
				/>
			</Section>

			<Section title={tp.data} hint={tp.dataHint}>
				<Group gap="xs">
					<Button
						variant="default"
						size="xs"
						leftSection={<Icon name="download" />}
						onClick={() => downloadJson({ version: 2, exportedAt: new Date().toISOString(), rows, dismissedLeads })}
					>
						{tp.backup}
					</Button>
					<FileButton onChange={importJson} accept="application/json">
						{(props) => (
							<Button {...props} variant="default" size="xs" leftSection={<Icon name="upload" />}>
								{tp.import}
							</Button>
						)}
					</FileButton>
				</Group>
				{pending && (
					<Group gap="xs">
						<Button size="xs" color="red" onClick={confirmImport}>
							{tp.importConfirm(pending.rows.length, rows.length)}
						</Button>
						<Button size="xs" variant="default" onClick={() => setPending(null)}>
							{tp.importCancel}
						</Button>
					</Group>
				)}
				<Stack gap={12}>
					<Group gap="xs">
						{armed ? (
							<Button size="xs" color="red" onClick={deleteAll}>
								{tp.deleteAllConfirm(rows.length)}
							</Button>
						) : (
							<Button
								size="xs"
								variant="default"
								c="red"
								className="hover-danger"
								leftSection={<Icon name="x" />}
								disabled={rows.length === 0}
								onClick={() => setArmed(true)}
							>
								{tp.deleteAll}
							</Button>
						)}
					</Group>
					<Text size="xs" c="dimmed">
						{tp.deleteAllHint}
					</Text>
				</Stack>
			</Section>
		</Stack>
	);
}
