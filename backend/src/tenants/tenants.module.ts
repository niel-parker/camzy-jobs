import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { SeatsController } from './seats.controller';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { TenantSubscription } from '../subscriptions/entities/tenant-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User, TenantSubscription])],
  controllers: [TenantsController, SeatsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
