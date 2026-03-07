import { IVoiceSession } from "@/types";
import mongoose, { Schema } from "mongoose";

const VoiceSessionSchema = new mongoose.Schema<IVoiceSession>({
  clerkId: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  startedAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date },
  durationSeconds: { type: Number, required: true, default: 0 },
  billingPeriodStart: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });

const VoiceSession = mongoose.models.VoiceSession || mongoose.model<IVoiceSession>('VoiceSession', VoiceSessionSchema);

export default VoiceSession;
