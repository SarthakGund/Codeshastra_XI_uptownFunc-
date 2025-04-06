'use client'

import Sidebar from "@/components/Sidebar";
import DashboardPage from "./dashborad/page";
// import ScrollableList from "@/components/hero";
import Head from 'next/head';
import dynamic from 'next/dynamic';
import CardLeft from "./components/cardleft";
import CardRight from "./components/cardright";
import { TextHoverEffect } from "@/components/ui/herot";
import Link from 'next/link';
// import { FlipWordsDemo } from "./components/flipwordsdemo";
import { SparklesPreview } from "./components/sparklespreview";






// Import ScrollableList component with dynamic import to avoid SSR issues with GSAP
// const Hero = dynamic(
  // () => import('@/components/hero'),
  // { ssr: false }
// );

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

        {/* <FlipWordsDemo/> */}
        <CardLeft/>
        <CardRight/>

    </>
  );
}