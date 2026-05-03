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
import { template as adminBookingNotification } from './admin-booking-notification.tsx'
import { template as adminNewsletterNotification } from './admin-newsletter-notification.tsx'
import { template as aiInboundReply } from './ai-inbound-reply.tsx'
import { template as portalInvite } from './portal-invite.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'lead-notification': leadNotification,
  'booking-confirmation': bookingConfirmation,
  'newsletter-welcome': newsletterWelcome,
  'kanban-task-assignment': kanbanTaskAssignment,
  'admin-booking-notification': adminBookingNotification,
  'admin-newsletter-notification': adminNewsletterNotification,
  'ai-inbound-reply': aiInboundReply,
  'portal-invite': portalInvite,
}
