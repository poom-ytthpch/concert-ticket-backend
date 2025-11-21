describe('jwt constants', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-value',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports jwtConstants.secret that matches process.env.JWT_SECRET at import time', () => {
    jest.isolateModules(() => {
      const { jwtConstants } = require('./constants');

      expect(jwtConstants).toBeDefined();
      expect(jwtConstants.secret).toBe('test-secret-value');
      expect(typeof jwtConstants.secret).toBe('string');
    });
  });
});
