import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
}

export default function Empty({
  icon: Icon = Package,
  title = "暂无数据",
  description,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-primary-100 border-dashed",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-base font-semibold text-primary-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-primary-500 text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
}
