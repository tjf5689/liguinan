
import React from "react"; import { cn } from "@/lib/utils";
export function Label({className,...props}:React.HTMLAttributes<HTMLLabelElement>){return <label className={cn("text-sm font-medium text-slate-700",className)} {...props}/>;}
