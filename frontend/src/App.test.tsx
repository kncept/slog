import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('app renders through to the root layout', () => {
  
  render(<App />)
  // if not exists, failure is: TestingLibraryElementError: Unable to find an element by: [data-testid="layout-root"]
  const layoutRoot = screen.getByTestId("layout-root")
  expect(layoutRoot).toBeDefined()
})
