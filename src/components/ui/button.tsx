
import React from "react"; import { cn } from "@/lib/utils";
const variants={default:"bg-slate-900 text-white hover:bg-slate-800",secondary:"bg-slate-100 text-slate-900 hover:bg-slate-200",outline:"border border-slate-300 hover:bg-slate-50",ghost:"hover:bg-slate-100"} as const;
const sizes={sm:"h-8 px-3 text-sm",default:"h-10 px-4",lg:"h-12 px-6 text-base",icon:"h-10 w-10 p-0"} as const;
export function Button({className,variant='default',size='default',...props}:{className?:string;variant?:keyof typeof variants;size?:keyof typeof sizes}&React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className={cn("inline-flex items-center justify-center rounded-2xl font-medium transition",variants[variant],sizes[size],className)} {...props}/>;
}
