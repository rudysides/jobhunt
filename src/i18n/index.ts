import { profile } from '../profile';
import { en, type Messages } from './en';

const messages: Record<string, Messages> = { en };

export const locale = profile?.locale && profile.locale in messages ? profile.locale : 'en';
export const t = messages[locale]!;
