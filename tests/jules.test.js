const { getStatusEmoji } = require('../jules.js');

describe('getStatusEmoji', () => {
  beforeAll(() => {
    global.Logger = {
      log: jest.fn()
    };
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should return 😴 for IDLE (case insensitive)', () => {
    expect(getStatusEmoji('IDLE')).toBe('😴');
    expect(getStatusEmoji('idle')).toBe('😴');
    expect(getStatusEmoji('Idle')).toBe('😴');
  });

  test('should return ⚙️ for RUNNING, ANALYZING, PLANNING', () => {
    expect(getStatusEmoji('RUNNING')).toBe('⚙️');
    expect(getStatusEmoji('ANALYZING')).toBe('⚙️');
    expect(getStatusEmoji('PLANNING')).toBe('⚙️');
  });

  test('should return ❓[**ACTION NEEDED**] for AWAITING_USER_FEEDBACK', () => {
    expect(getStatusEmoji('AWAITING_USER_FEEDBACK')).toBe('❓[**ACTION NEEDED**]');
  });

  test('should return ✅ for COMPLETED', () => {
    expect(getStatusEmoji('COMPLETED')).toBe('✅');
  });

  test('should return ❌ for FAILED', () => {
    expect(getStatusEmoji('FAILED')).toBe('❌');
  });

  test('should return ⚪ for null, undefined, or empty string', () => {
    expect(getStatusEmoji(null)).toBe('⚪');
    expect(getStatusEmoji(undefined)).toBe('⚪');
    expect(getStatusEmoji('')).toBe('⚪');
  });

  test('should return 🌀 for unknown states', () => {
    expect(getStatusEmoji('UNKNOWN')).toBe('🌀');
    expect(getStatusEmoji('SOME_OTHER_STATE')).toBe('🌀');
  });

  test('should handle non-string truthy values safely', () => {
    expect(getStatusEmoji(true)).toBe('🌀');
    expect(getStatusEmoji(123)).toBe('🌀');
    expect(getStatusEmoji({})).toBe('🌀');
  });

  test('should log the state', () => {
    getStatusEmoji('TEST_STATE');
    expect(global.Logger.log).toHaveBeenCalledWith('state: TEST_STATE');
  });
});
