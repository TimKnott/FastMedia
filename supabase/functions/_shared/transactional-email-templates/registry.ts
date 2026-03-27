/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as leadNotification } from './lead-notification.tsx'
import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as newsletterWelcome } from './newsletter-welcome.tsx'
import { template as kanbanTaskAssignment } from './kanban-task-assignment.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'lead-notification': leadNotification,
  'booking-confirmation': bookingConfirmation,
  'newsletter-welcome': newsletterWelcome,
  'kanban-task-assignment': kanbanTaskAssignment,
}
