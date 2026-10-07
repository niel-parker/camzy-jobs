import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should return super admin token when logging in with admin email', () => {
    const result = authService.login('admin@jobportal.com', 'admin123');
    expect(result).toHaveProperty('accessToken');
    expect(result.user.role).toBe('SUPER_ADMIN');
  });

  it('should return company admin user when logging in with techcorp email', () => {
    const result = authService.login('recruiter@techcorp.com', 'password');
    expect(result.user.email).toBe('recruiter@techcorp.com');
    expect(result.user.role).toBe('COMPANY_ADMIN');
  });

  it('should throw UnauthorizedException when invalid email is provided', () => {
    expect(() => authService.login('invalid@unknown.com', 'wrong')).toThrow(UnauthorizedException);
  });

  it('should return current user based on token', () => {
    const companyUser = authService.getCurrentUser('mock-jwt-token-usr-company-1');
    expect(companyUser.id).toBe('usr-company-1');

    const defaultUser = authService.getCurrentUser();
    expect(defaultUser.id).toBe('usr-admin-1');
  });
});
