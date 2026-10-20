import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('alterna entre claro y oscuro y recuerda la elección', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'light';
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Tema oscuro' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('reservausb-theme')).toBe('dark');
    expect(button).toHaveAttribute('aria-pressed', 'true');

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
