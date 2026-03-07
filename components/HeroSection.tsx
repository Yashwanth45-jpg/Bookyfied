import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


const HeroSection = () => {
  return (
    <section className='wrapper pt-28 mb-10'>
      <div className='wrapper'>
        <div className='relative rounded-3xl p-8 md:p-12 lg:p-16 shadow-soft' style={{ backgroundColor: '#f3e4c7' }}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center'>
            
            {/* Left Section - Content */}
            <div className='space-y-6'>
              <h1 className='text-4xl md:text-5xl font-bold text-black font-serif leading-tight'>
                Your Library
              </h1>
              <p className='text-lg text-(--text-secondary) leading-relaxed'>
                Convert your books into interactive AI conversations. Listen, learn, and discuss your favorite reads.
              </p>
              <Link href="/books/new">
                <button className='inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-black font-medium rounded-xl transition-colors shadow-soft-sm border border-(--border-subtle)'>
                  <span className='text-xl'>+</span>
                  Add new book
                </button>
              </Link>
            </div>

            {/* Center Section - Illustration */}
            <div className='flex justify-center items-center'>
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
            <div className='bg-white rounded-2xl p-6 shadow-soft border border-(--border-subtle)'>
              <div className='space-y-5'>
                {/* Step 1 */}
                <div className='flex gap-4'>
                  <div className='shrink-0 w-10 h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-xl font-bold text-(--text-primary) font-serif'>1</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-1'>Upload PDF</h3>
                    <p className='text-sm text-(--text-muted)'>Add your book file</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className='flex gap-4'>
                  <div className='shrink-0 w-10 h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-xl font-bold text-(--text-primary) font-serif'>2</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-1'>AI Processing</h3>
                    <p className='text-sm text-(--text-muted)'>We analyze the content</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className='flex gap-4'>
                  <div className='shrink-0 w-10 h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center'>
                    <span className='text-xl font-bold text-(--text-primary) font-serif'>3</span>
                  </div>
                  <div>
                    <h3 className='font-bold text-black mb-1'>Voice Chat</h3>
                    <p className='text-sm text-(--text-muted)'>Discuss with AI</p>
                  </div>
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
