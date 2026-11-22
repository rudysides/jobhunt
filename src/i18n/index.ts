import { profile } from '../profile';
import { en, type Messages } from './en';

const messages: Record<string, Messages> = { en };

export const locale = profile?.locale && Object.hasOwn(messages, profile.locale) ? profile.locale : 'en';
export const t = messages[locale]!;
