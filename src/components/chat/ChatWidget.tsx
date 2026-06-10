import { ActionIcon, Drawer, Group, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMessageCircle, IconSend, IconX } from '@tabler/icons-react'
import classes from './ChatWidget.module.css'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

/** Client-side greeting: friendly empty state without spending a model call. */
const GREETING: ChatMessage = {
  role: 'assistant',
  text: 'Hi! Ask me anything about our parts, prices and stock.',
}

// Placeholder conversation so the panel can be styled before the API is wired.
const DUMMY_MESSAGES: ChatMessage[] = [
  GREETING,
  { role: 'user', text: 'Whats your cheapest GPU?' },
  { role: 'assistant', text: 'The cheapest GPU we have is the Intel Arc B570 10G at $219 USD.' },
]

function ChatPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Group justify="space-between" px="md" py="sm" wrap="nowrap">
        <Text fw={700}>Support chat</Text>
        <ActionIcon variant="subtle" color="gray" aria-label="Close chat" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea className={classes.messages} px="md" type="auto">
        <Stack gap="xs" py="xs">
          {DUMMY_MESSAGES.map((message, index) => (
            <Text
              key={index}
              fz="sm"
              className={`${classes.bubble} ${message.role === 'user' ? classes.user : classes.assistant}`}
            >
              {message.text}
            </Text>
          ))}
        </Stack>
      </ScrollArea>

      <Group px="md" py="sm" gap="xs" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          radius="xl"
          placeholder="Type a message..."
          aria-label="Chat message"
        />
        <ActionIcon
          variant="gradient"
          gradient={{ from: 'violet', to: 'grape', deg: 135 }}
          size="lg"
          radius="xl"
          aria-label="Send message"
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </>
  )
}

interface ChatWidgetProps {
  opened: boolean
  onOpen: () => void
  onClose: () => void
}

/**
 * Support chat, mounted once in Layout so the conversation survives route
 * changes. Layout owns the open state because the triggers live in two
 * places: the floating button here (desktop only) and a header icon on
 * mobile, where a floating bubble would stack on the sticky build bar.
 * Desktop gets an anchored panel; mobile gets a full-screen drawer.
 */
export function ChatWidget({ opened, onOpen, onClose }: ChatWidgetProps) {
  const isMobile = useMediaQuery('(max-width: 48em)')

  return (
    <>
      {!opened && (
        <ActionIcon
          className={classes.fab}
          visibleFrom="sm"
          variant="gradient"
          gradient={{ from: 'violet', to: 'grape', deg: 135 }}
          size={56}
          radius="xl"
          aria-label="Open support chat"
          onClick={onOpen}
        >
          <IconMessageCircle size={28} />
        </ActionIcon>
      )}

      {isMobile ? (
        <Drawer
          opened={opened}
          onClose={onClose}
          position="bottom"
          size="100%"
          withCloseButton={false}
          padding={0}
          styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
        >
          <ChatPanel onClose={onClose} />
        </Drawer>
      ) : (
        opened && (
          <Paper className={classes.panel} shadow="lg" radius="lg" withBorder>
            <ChatPanel onClose={onClose} />
          </Paper>
        )
      )}
    </>
  )
}
