import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PassphraseStrength, { getPassphraseStrength } from '../PassphraseStrength';

describe('PassphraseStrength Logic', () => {
  it('should return weak for short passphrases', () => {
    const result = getPassphraseStrength('123');
    expect(result.label).toBe('Weak');
    expect(result.score).toBe(1);
  });

  it('should return very strong for complex passphrases', () => {
    const result = getPassphraseStrength('Complex!1234567890');
    expect(result.label).toBe('Very Strong');
    expect(result.score).toBe(4);
  });

  it('should return empty result for empty passphrase', () => {
    const result = getPassphraseStrength('');
    expect(result.label).toBe('');
    expect(result.score).toBe(0);
  });
});

describe('PassphraseStrength Component', () => {
  it('should not render when passphrase is empty', () => {
    const { container } = render(<PassphraseStrength passphrase="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should display label for weak passphrase', () => {
    render(<PassphraseStrength passphrase="password" />);
    expect(screen.getByText('Weak')).toBeDefined();
  });

  it('should display label for strong passphrase', () => {
    render(<PassphraseStrength passphrase="StrongPass123!" />);
    expect(screen.getByText('Very Strong')).toBeDefined();
  });

  it('should show tips for weak passphrases', () => {
    render(<PassphraseStrength passphrase="abc" />);
    expect(screen.getByText(/Recommendation:/)).toBeDefined();
  });
});
