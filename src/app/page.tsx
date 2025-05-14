'use client'

import Link from 'next/link';
import { SparklesPreview } from "./components/sparklespreview";

export default function Home() {
  return (
    <>
        <div className="flex flex-col items-center justify-center h-[400px] mt-[100px] bottom-0 bg-black">
          {/* <TextHoverEffect text="UtilX" duration={0.5} automatic={false} /> */}
          <SparklesPreview/>
        </div>
        <div className="h-20 z-10 relative bottom-32 w-full flex justify-center items-center">
            <Link href='/tools'>
          <button className="relative cursor-pointer inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-black text-white dark:bg-gray-900 rounded-md bg-transparent dark:bg-transparent">
              Try now →
            </span>
          </button>
            </Link>
        </div>
    </>
  );
}