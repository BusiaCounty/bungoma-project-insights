import { describe, it, expect } from 'vitest';
import { recordedExpenditure } from './projectFinancials';

describe('recorded expenditure', () => {
  it('does not interpret unconfirmed zero as no spending', () => {
    expect(recordedExpenditure({ actual_spend: 0, expenditure_confirmed: false })).toBeNull();
  });
  it('preserves explicitly confirmed zero spending', () => {
    expect(recordedExpenditure({ actual_spend: 0, expenditure_confirmed: true })).toBe(0);
  });
  it('preserves the exact recorded expenditure without rounding', () => {
    expect(recordedExpenditure({ actual_spend: 12345.67, expenditure_confirmed: true })).toBe(12345.67);
  });
});