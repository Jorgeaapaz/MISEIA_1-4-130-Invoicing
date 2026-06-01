import { MongoClient, Db, Collection, Document } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!uri) throw new Error('MONGODB_URI is not defined')
  if (!dbName) throw new Error('MONGODB_DB is not defined')

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  await client.connect()
  db = client.db(dbName)

  await createIndexes(db)

  return db
}

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T>> {
  const database = await getDb()
  return database.collection<T>(name)
}

async function createIndexes(database: Db): Promise<void> {
  await Promise.all([
    database
      .collection('users')
      .createIndex({ email: 1 }, { unique: true }),
    database
      .collection('magic_links')
      .createIndex({ token: 1 }, { unique: true }),
    database
      .collection('magic_links')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('sessions')
      .createIndex({ token: 1 }, { unique: true }),
    database
      .collection('sessions')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('customers')
      .createIndex({ userId: 1 }),
    database
      .collection('invoices')
      .createIndex({ userId: 1 }),
    database
      .collection('invoices')
      .createIndex({ customerId: 1 }),
  ])
}
