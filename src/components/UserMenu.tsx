import { ActionIcon, Menu, Stack, Text } from '@mantine/core'
import { IconCheck, IconLayoutDashboard, IconUser, IconUserShield } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { Role } from '../auth/cognito'
import { useAuth } from '../context/auth-context'

const ACCOUNTS: { role: Role; label: string; username: string }[] = [
  { role: 'normal', label: 'Shopper', username: 'user-normal' },
  { role: 'admin', label: 'Admin', username: 'user-admin' },
]

/** Header account switcher. Signing in happens silently, so switching accounts
 *  is a single click. The icon goes gradient when signed in as an admin. */
export function UserMenu() {
  const { role, isAdmin, switching, switchTo } = useAuth()

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <ActionIcon
          variant={isAdmin ? 'gradient' : 'default'}
          gradient={{ from: 'violet', to: 'grape', deg: 135 }}
          size="lg"
          aria-label="Account menu"
          loading={switching}
        >
          {isAdmin ? <IconUserShield size={18} /> : <IconUser size={18} />}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Switch account</Menu.Label>
        {ACCOUNTS.map((account) => (
          <Menu.Item
            key={account.role}
            disabled={switching}
            leftSection={
              role === account.role ? <IconCheck size={16} /> : <span style={{ width: 16 }} />
            }
            onClick={() => switchTo(account.role)}
          >
            <Stack gap={0}>
              <Text size="sm">{account.label}</Text>
              <Text size="xs" c="dimmed">
                {account.username}
              </Text>
            </Stack>
          </Menu.Item>
        ))}

        {isAdmin && (
          <>
            <Menu.Divider />
            <Menu.Item
              component={Link}
              to="/admin"
              leftSection={<IconLayoutDashboard size={16} />}
            >
              Admin dashboard
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
