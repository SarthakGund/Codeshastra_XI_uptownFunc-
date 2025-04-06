import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconFileText,
  IconHeart,
  IconHelp,
  IconRegex,
  IconRouteAltLeft,
  IconRuler,
  IconTerminal2,
} from "@tabler/icons-react";

const features = [
  {
    title: "Text Tamer: Unleash the Power of Perfect Text",
    description:
      "Conquer messy text! Validate JSON, XML, YAML, and craft beautiful Markdown with our integrated toolkit. Your words, flawlessly formatted.",
    icon: <IconTerminal2 />,
    route: "/tools/code-formatter"
  },
  {
    title: "Data Alchemist: Transmute Spreadsheets with Ease",
    description:
      "Effortlessly transform CSV to Excel and back again. Convert your data between formats in a snap – no magic wand required, just pure convenience.",
    icon: <IconEaseInOut />,
    route: "/tools/csv-excel-converter"
  },
  {
    title: "Regex Wizard: Master Pattern Matching",
    description:
      "Create and test regular expressions visually without writing complex code. Build powerful pattern matching rules with an intuitive interface.",
    icon: <IconRegex />,
    route: "/tools/regex-builder"
  },
  {
    title: "Unit Converter: Transform Measurements Instantly",
    description:
      "Convert between different units of measurement including length, weight, temperature, and currency. Make quick calculations with precision.",
    icon: <IconRuler />,
    route: "/tools/unit-converter"
  },
  {
    title: "OCR Extractor: Text from Images",
    description:
      "Extract text from images and documents with optical character recognition. Turn visual information into editable text instantly.",
    icon: <IconFileText />,
    route: "/tools/ocr"
  },
  {
    title: "The Randomizer's Realm: Generate the Unexpected",
    description:
      "Need a sprinkle of chance? Generate random numbers and unique identifiers (UUID/GUIDs) for development, testing, or just plain fun. Embrace the unpredictable!",
    icon: <IconCurrencyDollar />,
    route: "/tools/random-generator"
  },
  {
    title: "Fort Knox of Passwords: Secure Your Digital Life",
    description:
      "Create uncrackable passwords with our robust generator. Plus, explore extra security tools to keep your online world safe and sound.",
    icon: <IconCloud />,
    route: "/tools/password-generator"
  },
  {
    title: "Code Polisher & Inspector: Craft Pristine Code",
    description:
      "Say goodbye to messy code! Beautify and validate HTML, CSS, JavaScript, and more. Ensure your code shines and runs flawlessly.",
    icon: <IconRouteAltLeft />,
    route: "/tools/code-formatter"
  },
  {
    title: "Pixel Playground: Convert, Create, and Colorize",
    description:
      "Unleash your inner artist! Convert images, generate QR and barcodes, and play with colors using our intuitive picker and palette tools.",
    icon: <IconHelp />,
    route: "/tools/image-tools"
  },
  {
    title: "API Explorer's Hub: Your Gateway to Seamless Integration",
    description:
      "Dive into the world of APIs! Build requests and explore REST endpoints with our powerful client and builder. Connect and integrate like a pro.",
    icon: <IconAdjustmentsBolt />,
    route: "/tools/api-client"
  },
  {
    title: "Network Navigator: Peer into the Digital Infrastructure",
    description:
      "Explore the digital landscape! Perform IP lookups, DNS checks, and trace routes with our essential networking tools. Understand the connections that power the web.",
    icon: <IconHeart />,
    route: "/tools/network"
  },
];

const Feature = ({
  title,
  description,
  icon,
  index,
  route,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  route: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col group py-10 relative dark:border-neutral-800",
        index % 4 !== 3 && "lg:border-r",
        (index % 4 === 0) && "lg:border-l dark:border-neutral-800",
        index < features.length - (features.length % 4 || 4) && "lg:border-b dark:border-neutral-800"
      )}
    >
      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 transition duration-200 absolute inset-0 h-full w-full pointer-events-none",
          index < 4
            ? "bg-gradient-to-t from-neutral-700 dark:from-neutral-800 to-transparent"
            : "bg-gradient-to-b from-neutral-700 dark:from-neutral-800 to-transparent"
        )}
      />

      <div className="mb-4 relative z-10 px-10 text-neutral-300 dark:text-neutral-400">
        {icon}
      </div>

      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover:translate-x-2 transition duration-200 inline-block text-white dark:text-neutral-100">
          {title}
        </span>
      </div>

      <p className="text-sm text-neutral-300 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>

      <Link 
        href={route}
        className="absolute inset-0 z-20 cursor-pointer"
        aria-label={`Go to ${title}`}
      >
        <span className="sr-only">Go to {title}</span>
      </Link>
    </div>
  );
};

// ✅ Default export for Next.js
export default function ProductsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}
