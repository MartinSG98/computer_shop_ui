import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthToken } from '../api/client'
import { authenticate, demoAccounts, type Role } from '../auth/cognito'
import { AuthContext, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('normal')
  const [username, setUsername] = useState<string | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  // Starts true: the app signs in as user-normal on load.
  const [switching, setSwitching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const switchTo = useCallback(async (target: Role) => {
    setSwitching(true)
    setError(null)
    try {
      const account = demoAccounts[target]
      const session = await authenticate(account.username, account.password)
      // Only commit the role on a successful sign-in, so a failed switch leaves
      // the previous session intact.
      setRole(target)
      setUsername(session.username)
      setIdToken(session.idToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setSwitching(false)
    }
  }, [])

  // Default session on first load: user-normal.
  useEffect(() => {
    void switchTo('normal')
  }, [switchTo])

  // Keep the API client's bearer token in sync with the current session.
  useEffect(() => {
    setAuthToken(idToken)
  }, [idToken])

  const value = useMemo<AuthState>(
    () => ({
      role,
      username,
      isAdmin: role === 'admin',
      idToken,
      switching,
      error,
      switchTo,
    }),
    [role, username, idToken, switching, error, switchTo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
