import UploadForm from '@/components/UploadForm'
import React from 'react'

const page = () => {
  return (
    <main className='wrapper container'>

        <div className='mx-auto max-w-180 space-y-10'>
            <section className='flex flex-col items-center gap-5'>
                <h1 className='page-title-xl text-center'>Add a New Book</h1>
                <p className='subtitle text-center'>Upload a PDF to generate your interactive interview</p>
                <UploadForm />
            </section>
        </div>
    </main>
  )
}

export default page