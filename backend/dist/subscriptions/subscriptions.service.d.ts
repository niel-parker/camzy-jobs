import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
export declare class SubscriptionsService {
    private readonly planRepo;
    constructor(planRepo: Repository<SubscriptionPlan>);
    findAllPlans(): Promise<SubscriptionPlan[]>;
}
