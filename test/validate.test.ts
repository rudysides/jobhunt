import { describe, expect, it } from 'vitest';
import { cleanText, isEmail, isHttpUrl, leadErrors } from '../src/validate.ts';

const lead = {
	leadId: 'acme-junior-frontend',
	company: 'Acme',
	position: 'Junior Frontend Developer',
	location: 'Prague',
	contactName: '',
	role: 'HR',
	email: 'jobs@acme.example',
	source: 'jobscz',
	jobUrl: 'https://example.com/jobs/1',
	salary: '',
	notes: 'Fits.',
	foundAt: '2026-01-01',
	fit: 4,
};

describe('isEmail', () => {
	it.each(['jobs@acme.cz', 'first.last+tag@sub.example.co.uk'])('accepts %s', (e) => expect(isEmail(e)).toBe(true));
	// JL-03: anything that would add mailto: parameters or headers.
	it.each(['a@b.c?cc=x@evil.com', 'a@b.cz&body=x', 'a@b.cz#x', 'x y@a.cz', 'a%0a@b.cz', 'no-at.cz', 'a@b'])(
		'rejects %s',
		(e) => expect(isEmail(e)).toBe(false)
	);
});

describe('isHttpUrl', () => {
	it('accepts http and https', () => {
		expect(isHttpUrl('https://jobs.cz/rpd/1/')).toBe(true);
		expect(isHttpUrl('http://example.com')).toBe(true);
	});
	// JL-05
	it.each(['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'vbscript:x', '//example.com', ''])(
		'rejects %s',
		(u) => expect(isHttpUrl(u)).toBe(false)
	);
});

describe('cleanText', () => {
	it('strips control and bidi characters, keeps newlines and tabs', () =>
		expect(cleanText('a\u0000b‮\nc\td')).toBe('ab\nc\td'));
	it('caps the length', () => expect(cleanText('x'.repeat(50), 10)).toHaveLength(10));
	it('turns non-strings into empty strings', () => expect(cleanText({ a: 1 })).toBe(''));
});

describe('leadErrors', () => {
	it('passes a valid lead', () => expect(leadErrors(lead)).toEqual([]));
	it('reports every problem', () => {
		const errors = leadErrors({
			...lead,
			leadId: 'Bad Id',
			email: 'a@b.c?x',
			jobUrl: 'javascript:1',
			foundAt: '2026',
			fit: 9,
		});
		expect(errors).toEqual([
			'leadId must be kebab-case',
			'email is not a plain address',
			'jobUrl must be an http(s) link',
			'foundAt must be YYYY-MM-DD',
			'fit must be an integer 1-5',
		]);
	});
	it('rejects missing fields and control characters', () => {
		const { notes: _, ...noNotes } = lead;
		expect(leadErrors(noNotes)).toContain('"notes" must be a string');
		expect(leadErrors({ ...lead, company: 'A\u0007' })).toContain('"company" contains control characters');
	});
});
