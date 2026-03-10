'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteBook } from '@/lib/actions/book.actions';

interface BookCardProps {
  _id: string;
  title: string;
  author: string;
  coverURL: string;
  slug: string;
}

const BookCard = ({ _id, title, author, coverURL, slug }: BookCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    const result = await deleteBook(_id);
    if (result.success) {
      toast.success('Book deleted');
    } else {
      toast.error(result.message || 'Failed to delete book');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className='relative'>
      <Link href={`/books/${slug}`}>
        <article className='book-card'>
          <figure className='book-card-figure'>
            <div className='book-card-cover-wrapper'>
              <Image src={coverURL} alt={title} className='book-card-cover' width={133} height={200} />
            </div>
          </figure>
          <figcaption className='book-card-meta'>
            <h3 className='book-card-title'>{title}</h3>
            <p className='book-card-author'>{author}</p>
          </figcaption>
        </article>
      </Link>

      {/* Delete control */}
      <div className='absolute top-2 right-2' onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {showConfirm ? (
          <div className='flex items-center gap-1 bg-white rounded-lg shadow-lg px-2 py-1'>
            <span className='text-xs text-gray-600'>Delete?</span>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className='text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50 transition-colors'
            >
              {isDeleting ? '…' : 'Yes'}
            </button>
            <button
              onClick={handleCancelDelete}
              className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors'
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={handleDeleteClick}
            className='bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors'
            title='Delete book'
          >
            <Trash2 className='size-4 text-red-500' />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;