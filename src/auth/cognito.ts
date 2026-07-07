/**
 * Cognito configuration and a thin sign-in helper.
 *
 * This is a demo: the two accounts and their passwords are bundled so the header
 * "switch user" action can sign in silently, with no login form. They are not
 * real secrets, the accounts only unlock this demo's admin dashboard. Real
 * values can still be overridden via VITE_* env vars at build time.
 */
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js'

const env = import.meta.env

export const cognitoConfig = {
  userPoolId: env.VITE_COGNITO_USER_POOL_ID ?? 'eu-west-2_gpRPWBcFh',
  clientId: env.VITE_COGNITO_CLIENT_ID ?? '62hg4f8mkvkismaqs7qkab3fun',
}

export type Role = 'normal' | 'admin'

export const demoAccounts: Record<Role, { username: string; password: string }> = {
  normal: {
    username: env.VITE_DEMO_NORMAL_USERNAME ?? 'user-normal',
    password: env.VITE_DEMO_NORMAL_PASSWORD ?? 'DemoNormal123',
  },
  admin: {
    username: env.VITE_DEMO_ADMIN_USERNAME ?? 'user-admin',
    password: env.VITE_DEMO_ADMIN_PASSWORD ?? 'DemoAdmin123',
  },
}

const pool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
})

export interface Session {
  username: string
  /** ID token: carries `aud` (checked by the API Gateway authorizer) and the
   *  cognito:groups claim, so it is the bearer the backend expects. */
  idToken: string
}

/** Sign in with username + password (USER_PASSWORD_AUTH). Resolves the session. */
export function authenticate(username: string, password: string): Promise<Session> {
  const user = new CognitoUser({ Username: username, Pool: pool })
  user.setAuthenticationFlowType('USER_PASSWORD_AUTH')
  const details = new AuthenticationDetails({ Username: username, Password: password })

  return new Promise((resolve, reject) => {
    user.authenticateUser(details, {
      onSuccess: (session) =>
        resolve({ username, idToken: session.getIdToken().getJwtToken() }),
      onFailure: (err) => reject(err),
    })
  })
}
