// db.js
// In-memory mock database layer for AI Studio container environment
import dotenv from 'dotenv'

dotenv.config()

const store = {
  users: [],
  email_tokens: [],
  sessions: [],
  nextUserId: 1,
  nextTokenId: 1,
  nextSessionId: 1
}

class MockRequest {
  constructor(store) {
    this.inputs = {}
    this.store = store
  }

  input(name, type, value) {
    this.inputs[name] = value
    return this
  }

  async query(q) {
    const inputs = this.inputs
    const store = this.store

    if (q.includes('SELECT id FROM users WHERE email = @email')) {
      const user = store.users.find(u => u.email?.toLowerCase() === inputs.email?.toLowerCase())
      return { recordset: user ? [{ id: user.id }] : [] }
    }

    if (q.includes('INSERT INTO users')) {
      const id = store.nextUserId++
      const user = { id, email: inputs.email, password_hash: inputs.password_hash, is_verified: 0 }
      store.users.push(user)
      return { recordset: [{ id }] }
    }

    if (q.includes('INSERT INTO email_tokens')) {
      const token = {
        id: store.nextTokenId++,
        user_id: inputs.user_id,
        token: inputs.token,
        type: inputs.type,
        expires_at: inputs.expires_at
      }
      store.email_tokens.push(token)
      return { recordset: [] }
    }

    if (q.includes('SELECT * FROM email_tokens')) {
      const token = store.email_tokens.find(t => t.token === inputs.token && t.type === (inputs.type || 'verify'))
      return { recordset: token ? [token] : [] }
    }

    if (q.includes('UPDATE users SET is_verified = 1')) {
      const user = store.users.find(u => u.id === inputs.user_id)
      if (user) user.is_verified = 1
      return { recordset: [] }
    }

    if (q.includes('DELETE FROM email_tokens WHERE token = @token')) {
      store.email_tokens = store.email_tokens.filter(t => t.token !== inputs.token)
      return { recordset: [] }
    }

    if (q.includes('DELETE FROM email_tokens WHERE user_id = @user_id')) {
      store.email_tokens = store.email_tokens.filter(t => !(t.user_id === inputs.user_id && t.type === inputs.type))
      return { recordset: [] }
    }

    if (q.includes('SELECT * FROM users WHERE email = @email')) {
      const user = store.users.find(u => u.email?.toLowerCase() === inputs.email?.toLowerCase())
      return { recordset: user ? [user] : [] }
    }

    if (q.includes('INSERT INTO sessions')) {
      store.sessions.push({
        id: store.nextSessionId++,
        user_id: inputs.user_id,
        token: inputs.token,
        expires_at: inputs.expires_at
      })
      return { recordset: [] }
    }

    if (q.includes('DELETE FROM sessions WHERE token = @token')) {
      store.sessions = store.sessions.filter(s => s.token !== inputs.token)
      return { recordset: [] }
    }

    return { recordset: [] }
  }
}

export const sql = {
  NVarChar: 'NVarChar',
  Int: 'Int',
  DateTime2: 'DateTime2'
}

export const pool = {
  request: () => new MockRequest(store)
}

export const poolConnect = Promise.resolve(true)
