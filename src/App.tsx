/*
 * Jobhunt Local: two lists, "To apply" and "Applied".
 *
 * Leads come from profile/leads.json (written by the /find-jobs agent). New ones are added on top on reload,
 * removed ones never come back. Mail opens a prefilled e-mail (attach your CV manually), link opens the posting.
 */
import { useState } from 'react';
import { Box, Button, Code, Container, Flex, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
	AppHeader,
	CompanyAvatar,
	DeleteButton,
	FitTicks,
	Icon,
	LinkButton,
	ListSection,
	MailButton,
	say,
	sayWithUndo,
	shortDate,
} from './ui';
import { isSent, mailtoHref, useJobs, type JobRow } from './store';
import { Settings } from './Settings';
import { leads, profile } from './profile';
import { locale, t } from './i18n';

function Row({ r, sent }: { r: JobRow; sent: boolean }) {
	const { markSent, unmarkSent, remove, restore } = useJobs();
	const name = r.company || t.row.untitled;
	const sub = sent
		? [r.position, r.appliedAt && t.row.sentOn(shortDate(r.appliedAt, locale))]
		: [r.position, r.location, r.email ? '' : t.row.viaForm];
	return (
		// Sent rows are short, so the buttons stay next to the text even on mobile.
		<Flex align="center" gap={12} py={12} wrap={sent ? 'nowrap' : { base: 'wrap', sm: 'nowrap' }}>
			{/* Avatar and text stay on one line, only the buttons wrap below on mobile. */}
			<Flex align="center" gap={12} flex={sent ? '1 1 0' : { base: '1 1 100%', sm: '1 1 0' }} miw={0}>
				<CompanyAvatar name={name} />
				<Box flex="1 1 0" miw={0}>
					<Group gap={12} wrap="nowrap">
						<Text fw={500} truncate>
							{name}
						</Text>
						{!sent && r.fit && <FitTicks fit={r.fit} label={t.row.fit(r.fit)} />}
					</Group>
					<Text size="sm" c="dimmed" truncate>
						{sub.filter(Boolean).join(' · ')}
					</Text>
					{!sent && r.notes && (
						<Text size="xs" c="dimmed" lineClamp={2} mt={2}>
							{r.notes}
						</Text>
					)}
				</Box>
			</Flex>
			<Group gap={8} wrap="nowrap" ml={{ base: 'auto', sm: 0 }}>
				{!sent && r.email && <MailButton href={mailtoHref(r)} label={t.row.mailTo(r.email)} />}
				{r.jobUrl && <LinkButton href={r.jobUrl} label={t.link.open} />}
				{sent ? (
					<Button variant="default" size="xs" onClick={() => unmarkSent(r.id)}>
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
								say(t.row.sentToast(name));
							}}
						>
							{t.row.markSent}
						</Button>
					</>
				)}
			</Group>
		</Flex>
	);
}

/** Shown until there is a profile and at least one lead. */
function Onboarding() {
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
			</Stack>
		</Paper>
	);
}

const byFit = (a: JobRow, b: JobRow) => (b.fit ?? 0) - (a.fit ?? 0);

export default function App() {
	const { rows } = useJobs();
	const [screen, setScreen] = useState<'main' | 'settings'>('main');
	const toSend = rows.filter((r) => !isSent(r)).toSorted(byFit);
	const sent = rows.filter(isSent).toSorted((a, b) => b.appliedAt.localeCompare(a.appliedAt));

	return (
		<Container size={900} px={{ base: 'md', sm: 'lg' }} py="lg" pb={48}>
			<Stack gap="md">
				<AppHeader
					title={t.appTitle}
					onHome={() => setScreen('main')}
					actions={
						screen === 'main' && (
							<Button
								variant="default"
								size="xs"
								leftSection={<Icon name="sliders" />}
								onClick={() => setScreen('settings')}
							>
								{t.header.settings}
							</Button>
						)
					}
				/>
				{screen === 'settings' ? (
					<Settings onClose={() => setScreen('main')} />
				) : !profile || (leads.length === 0 && rows.length === 0) ? (
					<Onboarding />
				) : (
					<>
						<ListSection
							title={t.lists.toSend}
							items={toSend}
							getKey={(r) => r.id}
							renderItem={(r) => <Row r={r} sent={false} />}
							empty={t.lists.allSent}
						/>
						<ListSection
							title={t.lists.sent}
							items={sent}
							getKey={(r) => r.id}
							renderItem={(r) => <Row r={r} sent />}
						/>
					</>
				)}
			</Stack>
		</Container>
	);
}
