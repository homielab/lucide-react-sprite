import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock the DynamicIcon component
vi.mock('lucide-react/dynamic', () => ({
  DynamicIcon: (props: any) => <div data-testid='dynamic-icon' {...props} />
}))

import { LucideIcon as LucideIconProd } from '../components/LucideIcon'
import { LucideIcon as LucideIconDev } from '../components/LucideIcon.dev'

describe('LucideIcon', () => {
  describe('Development', () => {
    it('renders a DynamicIcon with the correct name', () => {
      render(<LucideIconDev name='activity' />)
      const icon = screen.getByTestId('dynamic-icon')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('name', 'activity')
    })
  })

  describe('Production', () => {
    it('renders an svg with a use tag pointing to the correct icon', () => {
      render(<LucideIconProd name='activity' />)
      const svg = screen.getByTestId('lucide-icon-prod')
      expect(svg).toBeInTheDocument()
      const use = svg.querySelector('use')
      expect(use).toHaveAttribute('href', '/icons.svg#activity')
    })
  })
})
