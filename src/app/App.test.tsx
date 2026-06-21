import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText('Carbon Footprint Tracker')).toBeInTheDocument();
  });

  it('renders main layout sections', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Key metrics' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Activity trackers' })).toBeInTheDocument();
  });
});
