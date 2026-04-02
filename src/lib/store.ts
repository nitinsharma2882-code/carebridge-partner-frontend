import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  PopupConfig,
  BookingRequest,
  EmergencyContact,
  AssistantProfile,
} from './types'

interface AppState {
  // Auth
  token:    string | null
  phone:    string
  profile:  AssistantProfile | null

  // Status
  isOnline:        boolean
  activeBooking:   BookingRequest | null
  incomingBooking: BookingRequest | null

  // Emergency
  emergencyContacts: EmergencyContact[]

  // UI
  popup:     PopupConfig | null
  sosActive: boolean

  // Actions
  setToken:             (t: string) => void
  setPhone:             (p: string) => void
  setProfile:           (p: AssistantProfile) => void
  setOnline:            (v: boolean) => void
  setActiveBooking:     (b: BookingRequest | null) => void
  setIncomingBooking:   (b: BookingRequest | null) => void
  setEmergencyContacts: (c: EmergencyContact[]) => void
  showPopup:            (cfg: PopupConfig) => void
  closePopup:           () => void
  setSOS:               (v: boolean) => void
  logout:               () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token:             null,
      phone:             '',
      profile:           null,
      isOnline:          true,   // ✅ DEFAULT = ONLINE (was false)
      activeBooking:     null,
      incomingBooking:   null,
      emergencyContacts: [],
      popup:             null,
      sosActive:         false,

      setToken: (t) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cb_assistant_token', t)
        }
        set({ token: t })
      },
      setPhone:             (p) => set({ phone: p }),
      setProfile:           (p) => set({ profile: p }),
      setOnline:            (v) => set({ isOnline: v }),
      setActiveBooking:     (b) => set({ activeBooking: b }),
      setIncomingBooking:   (b) => set({ incomingBooking: b }),
      setEmergencyContacts: (c) => set({ emergencyContacts: c }),
      showPopup:            (cfg) => set({ popup: cfg }),
      closePopup:           () => set({ popup: null }),
      setSOS:               (v) => set({ sosActive: v }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cb_assistant_token')
        }
        set({
          token:          null,
          profile:        null,
          isOnline:       true,  // ✅ RESET TO ONLINE on logout (not offline)
          activeBooking:  null,
          popup:          null,
        })
      },
    }),
    {
      name: 'cb-assistant-store',
      partialize: (s) => ({
        token:             s.token,
        phone:             s.phone,
        emergencyContacts: s.emergencyContacts,
        isOnline:          s.isOnline,   // ✅ NOW PERSISTED (was missing)
        profile:           s.profile,   // ✅ NOW PERSISTED (was missing)
      }),
    }
  )
)