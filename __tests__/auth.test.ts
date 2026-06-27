import { ObjectId } from 'mongodb'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  getCollection: jest.fn(),
}))

import { getCollection } from '@/lib/db'
import { cookies } from 'next/headers'
import { generateMagicLink, validateMagicLink, createSession, getSession } from '@/lib/auth'

const mockGetCollection = getCollection as jest.MockedFunction<typeof getCollection>
const mockCookies = cookies as jest.MockedFunction<typeof cookies>

function makeCol(overrides: Record<string, jest.Mock> = {}) {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId() }),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('generateMagicLink', () => {
  it('returns a UUID token', async () => {
    const usersCol = makeCol()
    const magicLinksCol = makeCol()
    mockGetCollection
      .mockResolvedValueOnce(usersCol as never)
      .mockResolvedValueOnce(magicLinksCol as never)

    const token = await generateMagicLink('test@example.com')
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('creates a user when one does not exist', async () => {
    const usersCol = makeCol({ findOne: jest.fn().mockResolvedValue(null) })
    const magicLinksCol = makeCol()
    mockGetCollection
      .mockResolvedValueOnce(usersCol as never)
      .mockResolvedValueOnce(magicLinksCol as never)

    await generateMagicLink('new@example.com')
    expect(usersCol.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com' })
    )
  })

  it('skips user creation when user already exists', async () => {
    const existingUser = { _id: new ObjectId(), email: 'old@example.com' }
    const usersCol = makeCol({ findOne: jest.fn().mockResolvedValue(existingUser) })
    const magicLinksCol = makeCol()
    mockGetCollection
      .mockResolvedValueOnce(usersCol as never)
      .mockResolvedValueOnce(magicLinksCol as never)

    await generateMagicLink('old@example.com')
    expect(usersCol.insertOne).not.toHaveBeenCalled()
  })
})

describe('createSession', () => {
  it('returns a UUID session token', async () => {
    const sessionsCol = makeCol()
    mockGetCollection.mockResolvedValueOnce(sessionsCol as never)

    const token = await createSession(new ObjectId())
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('inserts a session document with the given userId', async () => {
    const sessionsCol = makeCol()
    mockGetCollection.mockResolvedValueOnce(sessionsCol as never)
    const userId = new ObjectId()

    await createSession(userId)
    expect(sessionsCol.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ userId })
    )
  })
})

describe('getSession', () => {
  it('returns null when no session cookie present', async () => {
    mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) } as never)

    const result = await getSession()
    expect(result).toBeNull()
  })

  it('returns null when session token not in DB', async () => {
    mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue({ value: 'bad-token' }) } as never)
    mockGetCollection.mockResolvedValueOnce(makeCol({ findOne: jest.fn().mockResolvedValue(null) }) as never)

    const result = await getSession()
    expect(result).toBeNull()
  })

  it('returns user when session is valid', async () => {
    const userId = new ObjectId()
    const mockUser = { _id: userId, email: 'u@example.com', name: '' }
    const mockSession = { userId, token: 'valid-token', expiresAt: new Date(Date.now() + 100000) }

    mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue({ value: 'valid-token' }) } as never)
    mockGetCollection
      .mockResolvedValueOnce(makeCol({ findOne: jest.fn().mockResolvedValue(mockSession) }) as never)
      .mockResolvedValueOnce(makeCol({ findOne: jest.fn().mockResolvedValue(mockUser) }) as never)

    const result = await getSession()
    expect(result).toEqual({ user: mockUser })
  })
})

describe('validateMagicLink', () => {
  it('returns null for expired or already-used tokens', async () => {
    mockGetCollection.mockResolvedValueOnce(
      makeCol({ findOneAndUpdate: jest.fn().mockResolvedValue(null) }) as never
    )

    const result = await validateMagicLink('bad-token')
    expect(result).toBeNull()
  })

  it('returns the user when a valid token is provided', async () => {
    const userId = new ObjectId()
    const mockUser = { _id: userId, email: 'u@example.com', name: '' }
    const mockLink = { email: 'u@example.com', token: 'good-token', used: false }

    mockCookies.mockResolvedValue({ set: jest.fn(), get: jest.fn() } as never)
    mockGetCollection
      .mockResolvedValueOnce(makeCol({ findOneAndUpdate: jest.fn().mockResolvedValue(mockLink) }) as never)
      .mockResolvedValueOnce(makeCol({ findOne: jest.fn().mockResolvedValue(mockUser) }) as never)
      .mockResolvedValueOnce(makeCol() as never)

    const result = await validateMagicLink('good-token')
    expect(result).toEqual(mockUser)
  })
})
