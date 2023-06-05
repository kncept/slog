import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import Loader from './loaders/loaders'
import { StubLoader } from './loaders/stubLoaders'
import { act } from 'react-dom/test-utils'


test('app renders through to the root layout', async () => {
  Loader.Wrap(new StubLoader())
  
  await act(async () => {
    render(<App />)
  })
  
  // if not exists, failure is: TestingLibraryElementError: Unable to find an element by: [data-testid="layout-root"]
  const layoutRoot = screen.getByTestId("layout-root")
  expect(layoutRoot).toBeDefined()
})
