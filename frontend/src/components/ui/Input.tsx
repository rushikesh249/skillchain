import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={id} className="text-sm font-semibold text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-lg border border-gray-200 bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
                            className
                        )}
                        ref={ref}
                        id={id}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-600 font-medium animate-slide-up">{error}</p>}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
