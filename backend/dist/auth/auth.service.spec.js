"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService', () => {
    let authService;
    beforeEach(() => {
        authService = new auth_service_1.AuthService();
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
        expect(() => authService.login('invalid@unknown.com', 'wrong')).toThrow(common_1.UnauthorizedException);
    });
    it('should return current user based on token', () => {
        const companyUser = authService.getCurrentUser('mock-jwt-token-usr-company-1');
        expect(companyUser.id).toBe('usr-company-1');
        const defaultUser = authService.getCurrentUser();
        expect(defaultUser.id).toBe('usr-admin-1');
    });
});
//# sourceMappingURL=auth.service.spec.js.map