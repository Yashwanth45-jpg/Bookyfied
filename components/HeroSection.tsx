import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


const HeroSection = () => {
  return (
    <section className='pt-20 md:pt-28 mb-8 md:mb-10'>
      <div className='relative rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-soft' style={{ backgroundColor: '#f3e4c7' }}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 items-center'>
            
            {/* Left Section - Content */}
            <div className='space-y-4 sm:space-y-6'>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-black font-serif leading-tight'>
                Your Library
              </h1>
              <p className='text-base sm:text-lg text-(--text-secondary) leading-relaxed'>
                Convert your books into interactive AI conversations. Listen, learn, and discuss your favorite reads.
              </p>
              <Link href="/books/new">
                <button className='inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white hover:bg-gray-50 text-black font-medium rounded-xl transition-colors shadow-soft-sm border border-(--border-subtle)'>
                  <span className='text-xl'>+</span>
                  Add new book
                </button>
              </Link>
            </div>

            {/* Center Section - Illustration (hidden on mobile) */}
            <div className='hidden lg:flex justify-center items-center'>
              <div className='relative w-full max-w-100 aspect-square'>
                <Image 
                  src="/assets/hero-illustration.png" 
                  alt="Vintage books and globe illustration" 
                  fill
                  className='object-contain'
                  priority
                />
              </div>
            </div>

            {/* Right Section - Steps Card */}
            <div className='bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-(--border-subtle)'>
              <div className='space-y-4 sm:space-y-5'>
                {/* Step 1 */}
                <div className='flex gap-3 sm:gap-4'>
                  <div className='shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-lg sm:text-xl font-bold text-(--text-primary) font-serif'>1</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-0.5'>Upload PDF</h3>
                    <p className='text-sm text-(--text-muted)'>Add your book file</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className='flex gap-3 sm:gap-4'>
                  <div className='shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-lg sm:text-xl font-bold text-(--text-primary) font-serif'>2</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-0.5'>AI Processing</h3>
                    <p className='text-sm text-(--text-muted)'>We analyze the content</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className='flex gap-3 sm:gap-4'>
                  <div className='shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-lg sm:text-xl font-bold text-(--text-primary) font-serif'>3</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-0.5'>Voice Chat</h3>
                    <p className='text-sm text-(--text-muted)'>Discuss with AI</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
    </section>
  )
}

export default HeroSection
