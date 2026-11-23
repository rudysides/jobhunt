// Logo file names: must match the slug rule in .claude/skills/find-jobs/SKILL.md (step 7).
import { describe, expect, it } from 'vitest';
import { companyBase, companySlug } from '../src/profile.ts';

describe('companySlug', () => {
	it.each([
		['Seznam.cz, a.s.', 'seznam-cz'],
		['Acme B.V.', 'acme'],
		['Foo sp. z o.o.', 'foo'],
		['Café Müller GmbH', 'cafe-muller'],
		['Rossi S.p.A.', 'rossi'],
		['Bianchi S.r.l.', 'bianchi'],
		['Ibérica S.L.', 'iberica'],
		['Nord N.V.', 'nord'],
		['Paris SAS', 'paris'],
		['Lisboa, Lda', 'lisboa'],
		['Example Inc.', 'example'],
		['Firma spol. s r.o.', 'firma'],
	])('%s → %s', (name, slug) => expect(companySlug(name)).toBe(slug));

	it('keeps names that only look like a legal form inside', () => {
		expect(companyBase('Sasquatch Labs')).toBe('Sasquatch Labs');
		expect(companyBase('Agile Co')).toBe('Agile Co');
	});
});
