/*
 * Jobhunt: two lists, "To apply" and "Applied".
 *
 * Leads come from profile/leads.json (written by the /find-jobs agent). New ones are added on top on reload,
 * removed ones never come back. Mail opens a prefilled e-mail (attach your CV manually), link opens the posting.
 */
import { useRef, useState } from 'react';
import {
	Badge,
	Box,
	Button,
	Code,
	Container,
	Flex,
	Group,
	Paper,
	SegmentedControl,
	Select,
	Stack,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import {
	AppHeader,
	CompanyAvatar,
	DeleteButton,
	EditButton,
	FitTicks,
	Icon,
	LinkButton,
	ListSection,
	MailButton,
	NoteButton,
	sayDone,
	sayWithUndo,
	shortDate,
} from './ui';
import { isSent, mailtoHref, useJobs, type JobRow } from './store';
import { isEmail, isHttpUrl } from './validate.ts';
import { Settings } from './Settings';
import { JobForm } from './AddJob';
import { isDemo, leads, profile } from './profile';
import { locale, t } from './i18n';

function Row({ r, sent }: { r: JobRow; sent: boolean }) {
	const { markSent, unmarkSent, remove, restore, setNotes } = useJobs();
	const [editing, setEditing] = useState(false);
	const [editingJob, setEditingJob] = useState(false);
	const own = !r.leadId;
	const noteRef = useRef<HTMLTextAreaElement>(null);
	const cancelled = useRef(false);
	const myNotes = r.myNotes ?? '';
	const name = r.company || t.row.untitled;
	// The field stays mounted after blur, so its text is reset to what was actually saved.
	const saveNote = (el: HTMLTextAreaElement) => {
		const text = cancelled.current ? myNotes : el.value.trim();
		if (text !== myNotes) setNotes(r.id, text);
		el.value = text;
		cancelled.current = false;
		setEditing(false);
	};
	// The position reads in the text color, the rest of the line is dimmed.
	const details = (
		sent
			? [r.appliedAt && t.row.sentOn(shortDate(r.appliedAt, locale)), own && t.row.own]
			: [r.location, r.email ? '' : t.row.viaForm, own && t.row.own]
	).filter(Boolean);
	return (
		<Box py={12}>
			{/* Sent rows are short, so the buttons stay next to the text even on mobile. */}
			<Flex align="center" gap={12} wrap={sent ? 'nowrap' : { base: 'wrap', sm: 'nowrap' }}>
				{/* Only the buttons wrap below on mobile. */}
				<Box flex={sent ? '1 1 0' : { base: '1 1 100%', sm: '1 1 0' }} miw={0}>
					{/* Avatar next to company and position, notes run full width below it. */}
					<Group gap={12} wrap="nowrap">
						<CompanyAvatar name={name} />
						<Box flex="1 1 0" miw={0}>
							<Group gap={12} wrap="nowrap">
								<Text fw={500} truncate>
									{name}
								</Text>
								{!sent && r.fit && <FitTicks fit={r.fit} label={t.row.fit(r.fit)} />}
							</Group>
							<Text size="sm" truncate>
								{r.position}
								{details.length > 0 && (
									<Text span c="dimmed" inherit>
										{r.position ? ' · ' : ''}
										{details.join(' · ')}
									</Text>
								)}
							</Text>
						</Box>
					</Group>
					{!sent && r.notes && (
						<Text size="sm" c="dimmed" lineClamp={2} mt={8} style={{ overflowWrap: 'anywhere' }}>
							{r.notes}
						</Text>
					)}
				</Box>
				<Group gap={8} wrap="nowrap" ml={{ base: 'auto', sm: 0 }}>
					{!sent && isEmail(r.email) && <MailButton href={mailtoHref(r)} label={t.row.mailTo(r.email)} />}
					{sent && (
						<NoteButton
							active={myNotes !== ''}
							editing={editing}
							label={editing ? t.row.note.save : myNotes ? t.row.note.edit : t.row.note.add}
							onClick={() =>
								editing ? noteRef.current?.blur() : myNotes ? noteRef.current?.focus() : setEditing(true)
							}
						/>
					)}
					{isHttpUrl(r.jobUrl) && <LinkButton href={r.jobUrl} label={t.link.open} />}
					{own && <EditButton label={t.row.edit} onClick={() => setEditingJob(true)} />}
					{sent ? (
						<Button
							variant="default"
							size="xs"
							className="hover-accent"
							leftSection={<Icon name="undo" />}
							onClick={() => unmarkSent(r.id)}
						>
							{t.row.undo}
						</Button>
					) : (
						<>
							<DeleteButton
								labels={t.del}
								onRemove={() => {
									const index = useJobs.getState().rows.findIndex((x) => x.id === r.id);
									remove(r.id);
									sayWithUndo(t.row.removedToast(name), t.row.undo, () => restore(r, index));
								}}
							/>
							<Button
								variant="default"
								c="var(--mantine-primary-color-filled)"
								className="hover-accent"
								size="xs"
								leftSection={<Icon name="check" />}
								onClick={() => {
									markSent(r.id);
									sayDone(t.row.sentToast(name));
								}}
							>
								{t.row.markSent}
							</Button>
						</>
					)}
				</Group>
			</Flex>
			{/* Own notes only for applied rows, full width under the row so the buttons never move.
			    A saved note is the same textarea as the editor, borderless until focused, so nothing jumps. */}
			{sent && (editing || myNotes) && (
				<Textarea
					mt={8}
					size="sm"
					autosize
					minRows={1}
					autoFocus={!myNotes}
					ref={noteRef}
					classNames={{ input: 'note-field' }}
					aria-label={myNotes ? t.row.note.edit : t.row.note.add}
					placeholder={t.row.note.placeholder}
					defaultValue={myNotes}
					onFocus={() => setEditing(true)}
					onBlur={(e) => saveNote(e.currentTarget)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							cancelled.current = true;
							e.currentTarget.blur();
						}
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.blur();
					}}
				/>
			)}
			{editingJob && <JobForm row={r} onClose={() => setEditingJob(false)} />}
		</Box>
	);
}

/** Shown until there is a profile and at least one lead, or a job added by hand. */
function Onboarding({ onAdd }: { onAdd: () => void }) {
	const steps = profile ? ['/find-jobs'] : ['claude', '/setup', '/find-jobs'];
	return (
		<Paper p="lg">
			<Stack gap="sm">
				<Title order={2}>{t.onboarding.title}</Title>
				<Text size="sm" c="dimmed">
					{t.onboarding.intro}
				</Text>
				<Text size="sm">{profile ? t.onboarding.noLeads : t.onboarding.noProfile}</Text>
				<Code block>{steps.join('\n')}</Code>
				<Text size="sm" c="dimmed">
					{t.onboarding.thenReload}
				</Text>
				<Group>
					<Button variant="default" size="xs" leftSection={<Icon name="plus" />} onClick={onAdd}>
						{t.addJob.orByHand}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}

// Per-browser view choices (open tab, sort order). Without storage they fall back to the default.
function useStoredChoice<T extends string>(key: string, options: readonly T[], fallback: T) {
	const [value, setState] = useState<T>(() => {
		try {
			const v = localStorage.getItem(key);
			return options.includes(v as T) ? (v as T) : fallback;
		} catch {
			return fallback;
		}
	});
	const set = (v: T) => {
		setState(v);
		try {
			localStorage.setItem(key, v);
		} catch {
			// without storage the choice resets on reload
		}
	};
	return [value, set] as const;
}

const tabs = ['todo', 'applied'] as const;
type Tab = (typeof tabs)[number];

// leads.json is append-only, so a lead's position in it is its find order. Jobs added by hand count as newer than
// every lead, a lead that left leads.json as older.
const leadOrder = new Map(leads.map((l, i) => [l.leadId, i]));
const foundIndex = (r: JobRow) => (r.leadId ? (leadOrder.get(r.leadId) ?? -1) : leads.length);
const byFound = (a: JobRow, b: JobRow) =>
	foundIndex(b) - foundIndex(a) || (!a.leadId && !b.leadId ? b.updatedAt.localeCompare(a.updatedAt) : 0);

const sorts = ['fit', 'newest', 'company'] as const;
type Sort = (typeof sorts)[number];
const sorters: Record<Sort, (a: JobRow, b: JobRow) => number> = {
	fit: (a, b) => (b.fit ?? 0) - (a.fit ?? 0) || byFound(a, b),
	newest: byFound,
	company: (a, b) => a.company.localeCompare(b.company, locale, { sensitivity: 'base' }),
};

function TabLabel({ label, count }: { label: string; count: number }) {
	return (
		<Group gap={8} wrap="nowrap" justify="center">
			<span>{label}</span>
			<Text span c="dimmed" size="sm" className="tnum">
				{count}
			</Text>
		</Group>
	);
}

type Screen = 'main' | 'settings';

// The open screen lives in the URL hash, so a reload (e.g. after switching language) stays where it was.
function useScreen() {
	const [screen, setState] = useState<Screen>(() => (location.hash === '#settings' ? 'settings' : 'main'));
	const setScreen = (s: Screen) => {
		setState(s);
		history.replaceState(null, '', s === 'settings' ? '#settings' : location.pathname + location.search);
	};
	return [screen, setScreen] as const;
}

export default function App() {
	const { rows } = useJobs();
	const [screen, setScreen] = useScreen();
	const [tab, setTab] = useStoredChoice<Tab>('jobhunt-local.tab', tabs, 'todo');
	const [sort, setSort] = useStoredChoice<Sort>('jobhunt-local.sort', sorts, 'fit');
	const [adding, setAdding] = useState(false);
	const toSend = rows.filter((r) => !isSent(r)).toSorted(sorters[sort]);
	const sent = rows.filter(isSent).toSorted((a, b) => b.appliedAt.localeCompare(a.appliedAt));

	return (
		<Container size={900} px={{ base: 'md', sm: 'lg' }} py="lg" pb={48}>
			<Stack gap="md">
				<AppHeader
					title={t.appTitle}
					onHome={() => setScreen('main')}
					actions={
						screen === 'main' && (
							<Group gap="xs" wrap="nowrap">
								{isDemo && (
									<Badge variant="outline" color="gray" tt="none" title={t.header.demoHint}>
										{t.header.demo}
									</Badge>
								)}
								<Button
									variant="default"
									size="xs"
									leftSection={<Icon name="sliders" />}
									onClick={() => setScreen('settings')}
								>
									{t.header.settings}
								</Button>
							</Group>
						)
					}
				/>
				{screen === 'settings' ? (
					<Settings onClose={() => setScreen('main')} />
				) : rows.length === 0 && (!profile || leads.length === 0) ? (
					<Onboarding onAdd={() => setAdding(true)} />
				) : (
					<>
						{/* Tab switch and sort sit on the page above the card. */}
						<Group justify="space-between" gap="sm">
							<SegmentedControl
								aria-label={t.lists.label}
								className="page-switch"
								value={tab}
								onChange={(v) => setTab(v as Tab)}
								data={[
									{ value: 'todo', label: <TabLabel label={t.lists.toSend} count={toSend.length} /> },
									{ value: 'applied', label: <TabLabel label={t.lists.sent} count={sent.length} /> },
								]}
							/>
							<Group gap="xs" wrap="nowrap">
								<Button
									variant="default"
									size="xs"
									className="hover-accent"
									leftSection={<Icon name="plus" />}
									onClick={() => setAdding(true)}
								>
									{t.addJob.button}
								</Button>
								{tab === 'todo' && (
									<Select
										size="xs"
										w={150}
										aria-label={t.lists.sort.label}
										leftSection={<Icon name="sort" />}
										allowDeselect={false}
										value={sort}
										onChange={(v) => v && setSort(v as Sort)}
										data={sorts.map((value) => ({ value, label: t.lists.sort[value] }))}
									/>
								)}
							</Group>
						</Group>
						<ListSection
							items={tab === 'todo' ? toSend : sent}
							getKey={(r) => r.id}
							renderItem={(r) => <Row r={r} sent={tab === 'applied'} />}
							empty={tab === 'todo' ? t.lists.allSent : t.lists.noneSent}
						/>
					</>
				)}
			</Stack>
			{adding && <JobForm applied={screen === 'main' && tab === 'applied'} onClose={() => setAdding(false)} />}
		</Container>
	);
}
