import { render, screen } from '@testing-library/react';
import App from './App';

test('renders admin dashboard heading', () => {
  render(<App />);
  const heading = screen.getByText(/hotel haven admin/i);
  expect(heading).toBeInTheDocument();
});
