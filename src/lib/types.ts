export type PopupType = 'success' | 'warning' | 'error' | 'confirm' | 'info'

export interface PopupAction {
  label:   string
  variant: 'primary' | 'secondary' | 'danger' | 'warning'
  fn:      () => void
}

export interface PopupConfig {
  type:     PopupType
  title:    string
  body:     string
  icon?:    string
  actions:  PopupAction[]
}

export interface EmergencyContact {
  id:        string
  name:      string
  phone:     string
  relation:  string
  isPrimary?: boolean
}

export interface BookingRequest {
  id:             string
  customerId:     string
  customerName:   string
  customerPhone:  string
  customerRating: number
  address:        string
  services:       string[]
  distance:       string
  eta:            string
  fare:           number
  lat:            number
  lng:            number
}

export interface Transaction {
  id:           string
  type:         string
  amount:       number
  status:       'paid' | 'pending' | 'processing'
  date:         string
  customerName: string
  duration:     string
  ref:          string
}

export interface AssistantProfile {
  id:          string
  name:        string
  phone:       string
  email:       string
  city:        string
  rating:      number
  totalTrips:  number
  experience:  string
  languages:   string[]
  isVerified:  boolean
  isOnline:    boolean
  documents:   Document[]
}

export interface Document {
  id:         string
  type:       string
  status:     'verified' | 'pending' | 'rejected' | 'missing'
  uploadedAt: string
}