/*
 * Last line of defence (JL-04, JL-10): if rendering crashes, for example on bad saved data, show a way out
 * instead of a blank page that survives every reload. Download the raw data first, then reset.
 */
import { Component, type ReactNode } from 'react';
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { downloadJson } from './ui';
import { t } from './i18n';

const PREFIX = 'jobhunt-local.';

const storedKeys = () => Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));

function downloadRaw() {
	downloadJson(Object.fromEntries(storedKeys().map((k) => [k, localStorage.getItem(k)])), 'jobhunt-raw');
}

function reset() {
	for (const k of storedKeys()) localStorage.removeItem(k);
	location.reload();
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
	state = { error: null as Error | null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		const te = t.crash;
		return (
			<Container size="sm" py="xl">
				<Stack gap="md">
					<Title order={1} fz="xl">
						{te.title}
					</Title>
					<Text size="sm">{te.body}</Text>
					<Text size="xs" c="dimmed" ff="monospace">
						{error.message}
					</Text>
					<Group gap="xs">
						<Button variant="default" size="xs" onClick={downloadRaw}>
							{te.download}
						</Button>
						<Button size="xs" color="red" onClick={reset}>
							{te.reset}
						</Button>
					</Group>
				</Stack>
			</Container>
		);
	}
}
