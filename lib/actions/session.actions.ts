'use server';
import VoiceSession from "@/DataBase/models/voiceSession.model";
import { connectToDatabase } from "@/DataBase/mongoose";
import {StartSessionResult} from "@/types";
import { getCurrentBillingPeriodStart, isUnlimitedSessions } from "../subscription-constants";
import { getUserSubscriptionPlan } from "../subscription.server";



export const startVoiceSession = async (clerkId : string, bookId : string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        // Get user's subscription plan
        const userPlan = await getUserSubscriptionPlan();
        
        // Skip session limit check for unlimited plans (Pro)
        if (!isUnlimitedSessions(userPlan.slug)) {
            const billingPeriodStart = getCurrentBillingPeriodStart();
            
            // Count sessions in current billing period
            const sessionCount = await VoiceSession.countDocuments({
                clerkId,
                billingPeriodStart: billingPeriodStart,
            });
            
            if (sessionCount >= userPlan.maxSessionsPerMonth) {
                return {
                    success: false,
                    error: `You've reached your plan limit of ${userPlan.maxSessionsPerMonth} sessions per month. Please upgrade your plan to start more sessions.`,
                };
            }
        }

        const session  = await VoiceSession.create({
            clerkId,
            bookId,
            startAt : new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: userPlan.maxSessionDurationMinutes,
        }
    }
    catch (error) {
        console.error('Error starting voice session:', error);
        return {
            success: false,
            error : 'Failed to start voice session',
        }
    }

}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<{success: boolean; error?: string}> => {
    try {
        await connectToDatabase();

        const result = await VoiceSession.findByIdAndUpdate(
            sessionId,
            {
                endedAt: new Date(),
                durationSeconds: durationSeconds
            },
            { new: true }
        );

        if (!result) {
            return {
                success: false,
                error: 'Session not found'
            };
        }

        return {
            success: true
        };
    }
    catch (error) {
        console.error('Error ending voice session:', error);
        return {
            success: false,
            error: 'Failed to end voice session',
        };
    }
}

