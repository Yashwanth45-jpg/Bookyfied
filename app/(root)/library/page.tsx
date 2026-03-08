import HeroSection from '@/components/HeroSection'
import BookCard from '@/components/BookCard';
import Search from '@/components/Search';
import { getAllBooks } from '@/lib/actions/book.actions';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

const page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
  const { userId } = await auth();
  const { query } = await searchParams;
  const bookResults = userId ? await getAllBooks(userId, query) : { success: false, data: [] };
  const books = bookResults.success ? bookResults.data ?? [] : [];

  return (
    <main className='wrapper pb-16'>
      <HeroSection />

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h2 className='text-2xl sm:text-3xl font-serif font-bold text-[#212a3b]'>Recent Books</h2>
        <Search />
      </div>

      {books.length === 0 ? (
        <div className='text-center py-16 text-(--text-muted)'>
          <p className='text-lg font-medium'>{query ? `No books found for "${query}"` : 'No books yet. Add your first book!'}</p>
        </div>
      ) : (
        <div className='library-books-grid'>
          {books.map((book) => (
            <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
          ))}
        </div>
      )}
    </main>
  )
}

export default page;