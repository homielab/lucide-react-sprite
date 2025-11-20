'use client'

import { CustomIcon, LucideIcon } from 'lucide-react-sprite'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-8'>lucide-react-sprite Example</h1>
        <div className='grid grid-cols-2 gap-8'>
          <div className='flex flex-col items-center'>
            <h2 className='text-2xl font-semibold mb-4'>Lucide Icons</h2>
            <div className='flex gap-4'>
              <LucideIcon name='activity' size={48} />
              <LucideIcon name='home' size={48} />
              <LucideIcon name='settings' size={48} />
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <h2 className='text-2xl font-semibold mb-4'>Custom Icons</h2>
            <div className='flex gap-4'>
              <CustomIcon name='smiley' size={48} />
              <CustomIcon name='box' size={48} />
            </div>
          </div>
        </div>
        <p className='mt-8 text-lg text-gray-600'>
          In development, these icons are loaded as individual components or
          images. In production, they are loaded from a single SVG sprite.
        </p>
      </div>
    </main>
  )
}
