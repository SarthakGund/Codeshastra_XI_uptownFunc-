'use client'

import Sidebar from "@/components/Sidebar";
import DashboardPage from "./dashborad/page";
import ScrollableList from "@/components/hero";
import Head from 'next/head';
import dynamic from 'next/dynamic';




// Import ScrollableList component with dynamic import to avoid SSR issues with GSAP
const Hero = dynamic(
  () => import('@/components/hero'),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <Head>
        {/* <title>Scroll Effect Demo</title> */}
        <meta name="description" content="Scroll animation effect with color transitions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Hero
        theme="dark"
        animate={true}
        snap={true}
        startHue={0}
        endHue={360}
        enableScrollbarSync={true}
      />
    </>
  );
}