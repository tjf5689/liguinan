
import React from "react"; import { cn } from "@/lib/utils";
export function Badge({className,...props}:React.HTMLAttributes<HTMLSpanElement>){return <span className={cn("inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium",className)} {...props}/>;}
