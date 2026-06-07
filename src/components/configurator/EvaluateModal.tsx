import { useEffect, useState } from 'react'
import { Button, Group, Modal, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { IconBriefcase, IconChevronLeft, IconDeviceGamepad2, IconMovie } from '@tabler/icons-react'
import type { Resolution, UseCase } from '../../api/types'
import classes from './EvaluateModal.module.css'

const USE_CASES: { value: UseCase; label: string; desc: string; icon: typeof IconBriefcase }[] = [
  { value: 'gaming', label: 'Gaming', desc: 'High frame rates in games', icon: IconDeviceGamepad2 },
  { value: 'content', label: 'Content creation', desc: 'Editing, rendering, streaming', icon: IconMovie },
  { value: 'everyday', label: 'Everyday / office', desc: 'Browsing, docs, light use', icon: IconBriefcase },
]

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: '1080p', label: '1080p' },
  { value: '1440p', label: '1440p' },
  { value: '4k', label: '4K' },
]

interface Props {
  opened: boolean
  onClose: () => void
  onComplete: (useCase: UseCase, resolution: Resolution) => void
}

export function EvaluateModal({ opened, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [useCase, setUseCase] = useState<UseCase | null>(null)

  // Restart the flow each time the modal opens.
  useEffect(() => {
    if (opened) {
      setStep(0)
      setUseCase(null)
    }
  }, [opened])

  const pickUseCase = (value: UseCase) => {
    setUseCase(value)
    setStep(1)
  }

  const pickResolution = (value: Resolution) => {
    if (useCase) onComplete(useCase, value)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={step === 0 ? 'What will you use this PC for?' : 'What resolution do you target?'}
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Step {step + 1} of 2
        </Text>

        {step === 0 ? (
          USE_CASES.map(({ value, label, desc, icon: Icon }) => (
            <UnstyledButton key={value} className={classes.option} onClick={() => pickUseCase(value)}>
              <Group gap="md" p="sm" wrap="nowrap">
                <ThemeIcon variant="light" size={40} radius="md">
                  <Icon size={22} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>{label}</Text>
                  <Text size="sm" c="dimmed">
                    {desc}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          ))
        ) : (
          <>
            <Group grow>
              {RESOLUTIONS.map(({ value, label }) => (
                <Button key={value} variant="default" size="lg" onClick={() => pickResolution(value)}>
                  {label}
                </Button>
              ))}
            </Group>
            <Button variant="subtle" size="xs" leftSection={<IconChevronLeft size={16} />} onClick={() => setStep(0)}>
              Back
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  )
}