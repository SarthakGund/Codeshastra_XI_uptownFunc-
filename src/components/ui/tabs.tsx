import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = ({ 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  value: string; 
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

const TabsList = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex space-x-1 rounded-lg p-1 bg-gray-100 dark:bg-gray-800", className)}>
      {children}
    </div>
  )
}

const TabsTrigger = ({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;
  
  return (
    <button
      className={cn(
        "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100" 
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  )
}

const TabsContent = ({
  value,
  children
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;
  
  return <div>{children}</div>
}

// Context for Tabs
const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: "",
  onValueChange: () => {},
})

export { Tabs, TabsList, TabsTrigger, TabsContent }