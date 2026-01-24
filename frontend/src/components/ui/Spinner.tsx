import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export const Spinner = ({ className }: { className?: string }) => {
    return <Loader2 className={cn("animate-spin text-primary", className)} />
}

export const FullPageSpinner = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="h-10 w-10" />
    </div>
)
