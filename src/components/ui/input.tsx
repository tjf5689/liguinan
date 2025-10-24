
import React from "react"; import { cn } from "@/lib/utils";
export const Input=React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>(({className,...props},ref)=>(
  <input ref={ref} className={cn("h-10 px-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-slate-400",className)} {...props}/>));
Input.displayName="Input";
