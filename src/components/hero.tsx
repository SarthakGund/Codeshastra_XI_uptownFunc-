import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Text Tamer: Unleash the Power of Perfect Text",
      description:
        "Conquer messy text! Validate JSON, XML, YAML, and craft beautiful Markdown with our integrated toolkit. Your words, flawlessly formatted.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Data Alchemist: Transmute Spreadsheets with Ease",
      description:
        "Effortlessly transform CSV to Excel and back again. Convert your data between formats in a snap – no magic wand required, just pure convenience.",
      icon: <IconEaseInOut />,
    },
    {
      title: "The Randomizer's Realm: Generate the Unexpected",
      description:
        "Need a sprinkle of chance? Generate random numbers and unique identifiers (UUID/GUIDs) for development, testing, or just plain fun. Embrace the unpredictable!",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Fort Knox of Passwords: Secure Your Digital Life",
      description:
        "Create uncrackable passwords with our robust generator. Plus, explore extra security tools to keep your online world safe and sound.",
      icon: <IconCloud />,
    },
    {
      title: "Code Polisher & Inspector: Craft Pristine Code",
      description:
        "Say goodbye to messy code! Beautify and validate HTML, CSS, JavaScript, and more. Ensure your code shines and runs flawlessly.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Pixel Playground: Convert, Create, and Colorize",
      description:
        "Unleash your inner artist! Convert images, generate QR and barcodes, and play with colors using our intuitive picker and palette tools.",
      icon: <IconHelp />,
    },
    {
      title: "API Explorer's Hub: Your Gateway to Seamless Integration",
      description:
        "Dive into the world of APIs! Build requests and explore REST endpoints with our powerful client and builder. Connect and integrate like a pro.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Network Navigator: Peer into the Digital Infrastructure",
      description:
        "Explore the digital landscape! Perform IP lookups, DNS checks, and trace routes with our essential networking tools. Understand the connections that power the web.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};