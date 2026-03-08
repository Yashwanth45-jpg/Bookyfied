export const PLANS = {
    FREE: 'free',
    STANDARD: 'standard',
    PRO: 'pro',
} as const;

export type PlanType = typeof PLANS[keyof typeof PLANS];

export interface PlanLimits {
    maxBooks: number;
    maxSessionsPerMonth: number;
    maxSessionDurationMinutes: number; // in minutes
    hasSessionHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    [PLANS.FREE]: {
        maxBooks: 1,
        maxSessionsPerMonth: 5,
        maxSessionDurationMinutes: 5,
        hasSessionHistory: false,
    },
    [PLANS.STANDARD]: {
        maxBooks: 10,
        maxSessionsPerMonth: 100,
        maxSessionDurationMinutes: 15,
        hasSessionHistory: true,
    },
    [PLANS.PRO]: {
        maxBooks: 100,
        maxSessionsPerMonth: Infinity,
        maxSessionDurationMinutes: 60,
        hasSessionHistory: true,
    },
};

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

export const isUnlimitedSessions = (plan: PlanType): boolean => {
    return PLAN_LIMITS[plan].maxSessionsPerMonth === Infinity;
};

export const DEFAULT_MAX_SESSION_MINUTES = PLAN_LIMITS[PLANS.FREE].maxSessionDurationMinutes;