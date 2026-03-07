'use server';
import VoiceSession from "@/DataBase/models/voiceSession.model";
import { connectToDatabase } from "@/DataBase/mongoose";
import {StartSessionResult} from "@/types";
import { getCurrentBillingPeriodStart } from "../subscription-constants";



export const startVoiceSession = async (clerkId : string, bookId : string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        const session  = await VoiceSession.create({
            clerkId,
            bookId,
            startAt : new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString()
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

