import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  it('renders', () => {
    const wrapper = render(<App />)

    screen.debug()

    expect(wrapper).toMatchSnapshot()
  })
})
