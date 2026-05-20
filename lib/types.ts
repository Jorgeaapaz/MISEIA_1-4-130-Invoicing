import { ObjectId } from 'mongodb'

export interface User {
  _id: ObjectId
  email: string
  name: string
  company?: CompanyInfo
  createdAt: Date
  updatedAt: Date
}

export interface CompanyInfo {
  name: string
  address?: string
  taxId?: string
  phone?: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface MagicLink {
  _id: ObjectId
  email: string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface Session {
  _id: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface Customer {
  _id: ObjectId
  userId: ObjectId
  name: string
  email: string
  address?: Address
  taxId?: string
  createdAt: Date
  updatedAt: Date
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export interface Invoice {
  _id: ObjectId
  userId: ObjectId
  customerId: ObjectId
  number: string
  status: InvoiceStatus
  items: InvoiceItem[]
  subtotalCents: number
  taxRate: number
  taxCents: number
  totalCents: number
  issuedAt: Date
  dueAt: Date
  paidAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface ApiError {
  error: string
}
