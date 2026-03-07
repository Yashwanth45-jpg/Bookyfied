import React from 'react'
import HeroSection from '@/components/HeroSection'
import { sampleBooks } from '@/constants';
import BookCard from '@/components/BookCard';
import { getAllBooks } from '@/lib/actions/book.actions';

const page = async () => {
  const bookResults = await getAllBooks();
  const books = bookResults.success ? bookResults.data ??[] :[] // Replace with actual data fetching logic
  return (
    <main className='wrapper'>
      <HeroSection />
      <div className='library-books-grid'>
        {books.map((book) => (
          <BookCard key={book._id} title = {book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
        ))}
      </div>
    </main>
  )
}

export default page;