import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { CustomIcon as CustomIconProd } from '../components/CustomIcon'
import { CustomIcon as CustomIconDev } from '../components/CustomIcon.dev'

// Mock the fetch API for the development component
beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.toString().includes('/custom-icons/logo.svg')) {
      return Promise.resolve(
        new Response(
          '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20z"/></svg>',
          { status: 200 }
        )
      )
    }
    if (url.toString().includes('/custom-icons/smiley.svg')) {
      return Promise.resolve(
        new Response(
          '<svg viewBox="0 0 24 24"><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>',
          { status: 200 }
        )
      )
    }
    if (url.toString().includes('/custom-icons/box.svg')) {
      return Promise.resolve(
        new Response(
          '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>',
          { status: 200 }
        )
      )
    }
    return Promise.reject(new Error('not found'))
  })
})

describe('CustomIcon', () => {
  describe('Development', () => {
    it('renders an svg tag with fetched content and preserves attributes', async () => {
      render(<CustomIconDev name='logo' />)
      await waitFor(() => {
        const svg = screen.getByTestId('custom-icon-dev')
        expect(svg).toBeInTheDocument()
        expect(svg).toContainHTML('<path d="M12 2L2 22h20z"/>')
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24') // Assert that viewBox is preserved
      })
    })

    it('applies the color prop to the svg element', async () => {
      render(<CustomIconDev name='smiley' color='blue' />)
      await waitFor(() => {
        const svg = screen.getByTestId('custom-icon-dev')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('color', 'blue')
      })
    })
  })

  describe('Production', () => {
    it('renders an svg with a use tag pointing to the correct icon', () => {
      render(<CustomIconProd name='logo' />)
      const svg = screen.getByTestId('custom-icon-prod')
      expect(svg).toBeInTheDocument()
      const use = svg.querySelector('use')
      expect(use).toHaveAttribute('href', '/icons.svg#extend-logo')
    })

    it('applies the color prop to the svg element', () => {
      render(<CustomIconProd name='logo' color='red' />)
      const svg = screen.getByTestId('custom-icon-prod')
      expect(svg).toHaveAttribute('color', 'red')
    })
  })
})
