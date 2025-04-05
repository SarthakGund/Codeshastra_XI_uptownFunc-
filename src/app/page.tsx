'use client'

import Sidebar from "@/components/Sidebar";
import DashboardPage from "./dashborad/page";
// import ScrollableList from "@/components/hero";
import Head from 'next/head';
import dynamic from 'next/dynamic';
import CardLeft from "@/components/cardleft";




// Import ScrollableList component with dynamic import to avoid SSR issues with GSAP
// const Hero = dynamic(
  // () => import('@/components/hero'),
  // { ssr: false }
// );

export default function Home() {
  return (
    <>
        <CardLeft/>
    </>
  );
}