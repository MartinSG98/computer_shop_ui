import { useEffect, useRef, useState } from 'react'
import { ActionIcon, Box, Button, Drawer, Group, Loader, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMessageCircle, IconSend, IconTools, IconX } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { ApiError, CHAT_MESSAGE_MAX_LENGTH, sendChatMessage } from '../../api/client'
import classes from './ChatWidget.module.css'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

/** Client-side greeting: friendly empty state without spending a model call. */
const GREETING: ChatMessage = {
  role: 'assistant',
  text: "Hi! My name is Nova and I'm here to help with any questions about our catalogue, prices and stock.",
}

function errorText(error: unknown): string {
  if (error instanceof ApiError && error.status === 503) {
    return "Chat isn't available right now."
  }
  return "Sorry - I'm having trouble answering right now. Please try again in a moment."
}

interface ChatPanelProps {
  messages: ChatMessage[]
  input: string
  pending: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

function ChatPanel({ messages, input, pending, onInputChange, onSend, onClose }: ChatPanelProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  // Keep the latest message in view; smooth after the initial render.
  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  return (
    <>
      <Group justify="space-between" px="md" py="sm" wrap="nowrap">
        <Text fw={700}>Support chat</Text>
        <ActionIcon variant="subtle" color="gray" aria-label="Close chat" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea className={classes.messages} px="md" type="auto" viewportRef={viewportRef}>
        <Stack gap="xs" py="xs">
          {messages.map((message, index) => (
            <Box key={index} className={classes.messageGroup} data-role={message.role}>
              <Text
                fz="sm"
                className={`${classes.bubble} ${message.role === 'user' ? classes.user : classes.assistant}`}
              >
                {message.text}
              </Text>
              {/* The agent says the page is "top right of the screen", which is
                  wrong on mobile; a tappable chip is right everywhere. \s+ rather
                  than literal spaces: some models emit non-breaking spaces. */}
              {message.role === 'assistant' && /build\s+a\s+pc/i.test(message.text) && (
                <Button
                  component={Link}
                  to="/build"
                  onClick={onClose}
                  size="xs"
                  variant="light"
                  color="violet"
                  leftSection={<IconTools size={14} />}
                >
                  Open Build a PC
                </Button>
              )}
            </Box>
          ))}
          {pending && (
            <Box className={`${classes.bubble} ${classes.assistant}`}>
              <Loader type="dots" size="sm" color="gray" />
            </Box>
          )}
        </Stack>
      </ScrollArea>

      <Box
        component="form"
        px="md"
        py="sm"
        onSubmit={(event) => {
          event.preventDefault()
          onSend()
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <TextInput
            style={{ flex: 1 }}
            radius="xl"
            placeholder="Type a message..."
            aria-label="Chat message"
            maxLength={CHAT_MESSAGE_MAX_LENGTH}
            value={input}
            onChange={(event) => onInputChange(event.currentTarget.value)}
            disabled={pending}
            data-autofocus
          />
          <ActionIcon
            type="submit"
            variant="gradient"
            gradient={{ from: 'violet', to: 'grape', deg: 135 }}
            size="lg"
            radius="xl"
            aria-label="Send message"
            disabled={pending || input.trim() === ''}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
        {input.length >= CHAT_MESSAGE_MAX_LENGTH - 100 && (
          <Text fz="xs" c="dimmed" ta="right" mt={4}>
            {input.length}/{CHAT_MESSAGE_MAX_LENGTH}
          </Text>
        )}
      </Box>
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
 *
 * All conversation state lives here, not in ChatPanel: the mobile Drawer
 * unmounts its content when closed, and the conversation must outlive that.
 */
export function ChatWidget({ opened, onOpen, onClose }: ChatWidgetProps) {
  const isMobile = useMediaQuery('(max-width: 48em)')
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  // One conversation per page visit; AgentCore threads messages by this id.
  const sessionId = useRef<string>(crypto.randomUUID())

  const send = async () => {
    const message = input.trim()
    if (message === '' || pending) return
    setMessages((current) => [...current, { role: 'user', text: message }])
    setInput('')
    setPending(true)
    try {
      const { reply } = await sendChatMessage(message, sessionId.current)
      setMessages((current) => [...current, { role: 'assistant', text: reply }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: errorText(error) }])
    } finally {
      setPending(false)
    }
  }

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
          <ChatPanel
            messages={messages}
            input={input}
            pending={pending}
            onInputChange={setInput}
            onSend={send}
            onClose={onClose}
          />
        </Drawer>
      ) : (
        opened && (
          <Paper className={classes.panel} shadow="lg" radius="lg" withBorder>
            <ChatPanel
              messages={messages}
              input={input}
              pending={pending}
              onInputChange={setInput}
              onSend={send}
              onClose={onClose}
            />
          </Paper>
        )
      )}
    </>
  )
}
