import { notifications } from '@mantine/notifications';

export const say = (message: string, color?: string) => notifications.show({ message, color, withCloseButton: false });
