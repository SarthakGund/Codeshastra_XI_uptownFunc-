import Sidebar from "@/components/Sidebar";
import DashboardPage from "./dashborad/page";
import  {FeaturesSectionDemo} from "@/components/hero";
import { TextHoverEffect } from "@/components/TextHoverEffect";
export default function Home() {
  return (
      // <Sidebar/>
      <div className="w-full h-full overflow-x-hidden">

        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <TextHoverEffect text="UtilX" duration={0.5} automatic={false} />
        </div>
      <div className="w-full h-full overflow-x-hidden">
        <FeaturesSectionDemo />
      </div>
      </div>
  );
}
