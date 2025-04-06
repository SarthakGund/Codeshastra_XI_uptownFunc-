import * as React from "react"
import { cn } from "@/lib/utils"

const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-white shadow-sm dark:bg-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardContent }