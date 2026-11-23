/*
 * Add a job by hand, or edit one added that way. It becomes a row without a leadId, so leads.json never
 * changes or removes it. Everything goes through normalizeRow, the same checks as a backup import.
 */
import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Group, Modal, SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core';
import { normalizeRow, useJobs, type JobRow } from './store';
import { isEmail, isHttpUrl } from './validate.ts';
import { say, today } from './ui';
import { t } from './i18n';

const ta = t.addJob;
const FIELDS = ['company', 'position', 'jobUrl', 'email', 'location', 'salary', 'contactName', 'notes'] as const;
type Fields = Record<(typeof FIELDS)[number], string>;

const fromRow = (row?: JobRow): Fields => Object.fromEntries(FIELDS.map((k) => [k, row?.[k] ?? ''])) as Fields;

/** `row` edits that row; without it the form adds a new one, `applied` pre-checks "I already applied". */
export function JobForm({ row, applied = false, onClose }: { row?: JobRow; applied?: boolean; onClose: () => void }) {
	const { add, update } = useJobs();
	const [f, setF] = useState(() => fromRow(row));
	const [sent, setSent] = useState(applied);
	const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});

	const v = (k: keyof Fields) => f[k].trim();
	const errors = {
		email: v('email') && !isEmail(v('email')) ? ta.badEmail : undefined,
		jobUrl: v('jobUrl') && !isHttpUrl(v('jobUrl')) ? ta.badUrl : undefined,
	};
	const ok = v('company') !== '' && v('position') !== '' && !errors.email && !errors.jobUrl;

	const input = (k: keyof Fields) => ({
		value: f[k],
		onChange: (e: { currentTarget: { value: string } }) => setF({ ...f, [k]: e.currentTarget.value }),
		onBlur: () => setTouched({ ...touched, [k]: true }),
	});

	const submit = (e: FormEvent) => {
		e.preventDefault();
		if (!ok) return;
		const trimmed = Object.fromEntries(FIELDS.map((k) => [k, v(k)]));
		const clean = normalizeRow({
			...row,
			...trimmed,
			status: row ? row.status : sent ? 'applied' : 'todo',
			appliedAt: row ? row.appliedAt : sent ? today() : '',
			source: row?.source || 'own',
			leadId: null,
		});
		if (!clean) return;
		if (row) {
			update(row.id, Object.fromEntries(FIELDS.map((k) => [k, clean[k]])));
			say(ta.savedToast(clean.company));
		} else {
			add(clean);
			say(ta.addedToast(clean.company));
		}
		onClose();
	};

	return (
		<Modal opened onClose={onClose} title={row ? ta.titleEdit : ta.titleAdd} size="lg" centered>
			<form onSubmit={submit} noValidate>
				<Stack gap="sm">
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
						<TextInput label={ta.company} required maxLength={300} data-autofocus {...input('company')} />
						<TextInput label={ta.position} required maxLength={300} {...input('position')} />
					</SimpleGrid>
					<TextInput
						label={ta.jobUrl}
						type="url"
						placeholder="https://"
						maxLength={2048}
						error={touched.jobUrl && errors.jobUrl}
						{...input('jobUrl')}
					/>
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
						<TextInput
							label={ta.email}
							description={ta.emailHint}
							// Hint under the field, so the input lines up with Contact person next to it.
							inputWrapperOrder={['label', 'input', 'description', 'error']}
							type="email"
							maxLength={254}
							error={touched.email && errors.email}
							{...input('email')}
						/>
						<TextInput label={ta.contactName} maxLength={300} {...input('contactName')} />
						<TextInput label={ta.location} maxLength={300} {...input('location')} />
						<TextInput label={ta.salary} maxLength={300} {...input('salary')} />
					</SimpleGrid>
					<Textarea label={ta.notes} autosize minRows={2} maxRows={6} maxLength={5000} {...input('notes')} />
					{!row && <Checkbox label={ta.applied} checked={sent} onChange={(e) => setSent(e.currentTarget.checked)} />}
					<Group justify="flex-end" gap="xs" mt="xs">
						<Button variant="default" onClick={onClose}>
							{ta.cancel}
						</Button>
						<Button type="submit" disabled={!ok}>
							{row ? ta.save : ta.add}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
