import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = {
  value?: string | number | readonly string[]
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    // Convertir NaN a string vacío
    const safeValue = value !== undefined && typeof value === 'number' && isNaN(value) 
      ? '' 
      : value

    return (
      <input
        type={type}
        value={safeValue}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
