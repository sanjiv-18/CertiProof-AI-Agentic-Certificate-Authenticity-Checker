/**
 * Basic Frontend Unit Tests
 */

import { formatDate, truncateString } from '../src/utils/formatters';
import { OUTCOME_COLORS } from '../src/utils/constants';

describe('Frontend Utilities', () => {
  it('formats dates properly', () => {
    expect(formatDate(null)).toBe('Not recorded');
    expect(formatDate('')).toBe('Not recorded');
  });

  it('truncates strings exceeding max length', () => {
    expect(truncateString('Short text', 20)).toBe('Short text');
    expect(truncateString('This is a longer text that should be cut off', 10)).toBe('This is a ...');
  });

  it('has mappings for all standard verification outcomes', () => {
    expect(OUTCOME_COLORS.VERIFIED).toBeDefined();
    expect(OUTCOME_COLORS.MISMATCH).toBeDefined();
    expect(OUTCOME_COLORS.NOT_FOUND).toBeDefined();
    expect(OUTCOME_COLORS.NOT_CHECKED).toBeDefined();
    expect(OUTCOME_COLORS.UNRESOLVED).toBeDefined();
  });
});
