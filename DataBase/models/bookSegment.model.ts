import { IBookSegment } from "@/types";
import mongoose, { Schema } from "mongoose";

const BookSegmentSchema = new mongoose.Schema<IBookSegment>({
  clerkId: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  content: { type: String, required: true },
  segmentIndex: { type: Number, required: true },
  pageNumber: { type: Number },
  wordCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1 , pageNumber: 1 });

BookSegmentSchema.index({bookId : 1, content: "text"});

const BookSegment = mongoose.models.BookSegment || mongoose.model<IBookSegment>('BookSegment', BookSegmentSchema);

export default BookSegment;
