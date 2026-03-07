import { Document } from "mongodb";
import {IBook} from "@/types";
import mongoose from "mongoose";

const BookSchema = new mongoose.Schema<IBook>({
  clerkId: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  author: { type: String, required: true },
  persona: { type: String }, 
  fileURL: { type: String, required: true },
  fileBlobKey: { type: String, required: true },
  coverURL: { type: String, required: true },
  coverBlobKey: { type: String },
  fileSize: { type: Number, required: true },
  totalSegments: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Book = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;