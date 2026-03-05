import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditableText } from './EditableText'

describe('EditableText', () => {
  const defaultProps = {
    sectionKey: 'test.section',
    defaultText: 'Default text',
    onSave: vi.fn(),
  }

  it('renders the default text when no custom text is provided', () => {
    render(<EditableText {...defaultProps} />)

    expect(screen.getByText('Default text')).toBeInTheDocument()
  })

  it('renders the custom text when provided', () => {
    render(<EditableText {...defaultProps} customText="Custom text" />)

    expect(screen.getByText('Custom text')).toBeInTheDocument()
    expect(screen.queryByText('Default text')).not.toBeInTheDocument()
  })

  it('renders as the specified HTML element', () => {
    const { container } = render(<EditableText {...defaultProps} as="h1" />)

    expect(container.querySelector('h1')).toBeInTheDocument()
  })

  it('applies custom className to the text element', () => {
    render(<EditableText {...defaultProps} className="custom-class" />)

    const textElement = screen.getByText('Default text')
    expect(textElement).toHaveClass('custom-class')
  })

  it('shows the edit button with pencil icon', () => {
    render(<EditableText {...defaultProps} />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    expect(editButton).toBeInTheDocument()
  })

  it('opens the dialog when clicking the edit button', async () => {
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(screen.getByText('Modifier le texte')).toBeInTheDocument()
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('pre-fills the input with the current text when opening the dialog', async () => {
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} customText="Custom text" />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const input = screen.getByTestId('editable-text-input')
    expect(input).toHaveValue('Custom text')
  })

  it('calls onSave with the new text when clicking save', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} onSave={onSave} />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const input = screen.getByTestId('editable-text-input')
    await user.clear(input)
    await user.type(input, 'New text')

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith('test.section', 'New text')
  })

  it('calls onReset when clicking reset', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} onReset={onReset} customText="Custom" />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const resetButton = screen.getByRole('button', { name: /reinitialiser/i })
    await user.click(resetButton)

    expect(onReset).toHaveBeenCalledWith('test.section')
  })

  it('calls onSave with default text when clicking reset without onReset handler', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} onSave={onSave} customText="Custom" />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const resetButton = screen.getByRole('button', { name: /reinitialiser/i })
    await user.click(resetButton)

    expect(onSave).toHaveBeenCalledWith('test.section', 'Default text')
  })

  it('closes the dialog when clicking cancel', async () => {
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    expect(screen.getByText('Modifier le texte')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)

    expect(screen.queryByText('Modifier le texte')).not.toBeInTheDocument()
  })

  it('renders a textarea when multiline is true', async () => {
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} multiline />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const textarea = screen.getByTestId('editable-text-input')
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
  })

  it('renders an input when multiline is false', async () => {
    const user = userEvent.setup()
    render(<EditableText {...defaultProps} multiline={false} />)

    const editButton = screen.getByRole('button', { name: /modifier/i })
    await user.click(editButton)

    const input = screen.getByTestId('editable-text-input')
    expect(input.tagName.toLowerCase()).toBe('input')
  })
})
