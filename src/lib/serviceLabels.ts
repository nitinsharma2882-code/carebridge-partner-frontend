// Booking service display helpers — derives label/icon/category from the
// granular `serviceId` (+ `bookingType`) the consumer app's 4-card redesign
// sends, falling back to the legacy coarse `serviceType` for bookings that
// predate it. Keeps the partner app's three booking-list screens in sync
// without duplicating the mapping logic.

export interface ServiceDisplayBooking {
  serviceType?: string
  serviceId?:   string
  bookingType?: string
}

const LEGACY_LABELS: Record<string, string> = {
  opd_assistant: 'OPD Assistant',
  ambulance:     'Ambulance',
  nursing:       'Nursing Care',
  general:       'General Help',
}

const LEGACY_ICONS: Record<string, string> = {
  opd_assistant: '🩺',
  ambulance:     '🚑',
  nursing:       '💉',
  general:       '🏥',
}

const BOOKING_TYPE_LABEL: Record<string, string> = {
  scheduled: 'Scheduled',
  instant:   'Instant',
}

function bookingTypeSuffix(b: ServiceDisplayBooking): string {
  return b.bookingType ? ` · ${BOOKING_TYPE_LABEL[b.bookingType] || b.bookingType}` : ''
}

export function getServiceLabel(b: ServiceDisplayBooking): string {
  const serviceId = b.serviceId || ''
  if (serviceId.startsWith('hospital_')) return `Meet at the Location${bookingTypeSuffix(b)}`
  if (serviceId.startsWith('pickdrop_')) return `Pick & Drop Assistance${bookingTypeSuffix(b)}`
  if (serviceId === 'medicine_collection') return 'Medicine Collection'
  return LEGACY_LABELS[b.serviceType || ''] || 'Service'
}

export function getServiceIcon(b: ServiceDisplayBooking): string {
  const serviceId = b.serviceId || ''
  if (serviceId.startsWith('hospital_')) return '🏥'
  if (serviceId.startsWith('pickdrop_')) return '🚗'
  if (serviceId === 'medicine_collection') return '💊'
  return LEGACY_ICONS[b.serviceType || ''] || '🏥'
}

// True only for a real emergency-ambulance dispatch. Pick & Drop Assistance
// bookings are stored with serviceType 'ambulance' for backend routing
// compatibility, but per product direction are an ordinary accompaniment
// service — not a dispatch — so they must not trigger emergency styling.
// This stays false for every current booking until real Ambulance Provider
// dispatch ships (those bookings won't carry a pickdrop_ serviceId).
export function isEmergencyAmbulance(b: ServiceDisplayBooking): boolean {
  return b.serviceType === 'ambulance' && !(b.serviceId || '').startsWith('pickdrop_')
}

// ── Consumer contact / accessibility ────────────────────────────
// Populated on all 3 partner-facing booking read paths (GET
// /api/assistants/requests, GET /api/bookings, POST /:id/accept) as of
// the Phase A backend work.

export interface ConsumerContactBooking {
  patientPhone?: string
  userId?: { name?: string; phone?: string; age?: string; gender?: string }
}

// Ambulance/Pick&Drop bookings carry patientPhone as a first-class field
// (backend defaults it to the consumer's own phone when not explicitly
// set). Standard OPD bookings never populate patientPhone, so fall back
// to the populated consumer record — one path, not per-service branching.
export function getConsumerPhone(b: ConsumerContactBooking): string {
  return b.patientPhone || b.userId?.phone || ''
}

export interface AccessibilityInfo {
  hearing?:  string
  vision?:   string
  mobility?: string
}

const ACCESSIBILITY_LABELS: Record<string, Record<string, string>> = {
  vision:   { blind: 'Blind',                impaired: 'Low vision' },
  hearing:  { deaf: 'Deaf',                  hard_of_hearing: 'Hard of hearing' },
  mobility: { wheelchair: 'Wheelchair user', difficulty: 'Limited mobility' },
}

// null when the consumer never set any accessibility need — callers
// must not render a section at all in that case (never a placeholder).
export function getAccessibilitySummary(a?: AccessibilityInfo | null): string | null {
  if (!a) return null
  const parts = [
    a.vision   && a.vision   !== 'none' ? (ACCESSIBILITY_LABELS.vision[a.vision]     || a.vision)   : null,
    a.hearing  && a.hearing  !== 'none' ? (ACCESSIBILITY_LABELS.hearing[a.hearing]   || a.hearing)  : null,
    a.mobility && a.mobility !== 'none' ? (ACCESSIBILITY_LABELS.mobility[a.mobility] || a.mobility) : null,
  ].filter(Boolean) as string[]
  return parts.length > 0 ? parts.join(' · ') : null
}
