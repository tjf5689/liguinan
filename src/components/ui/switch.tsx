
import React from "react";
export function Switch({checked=false,onCheckedChange}:{checked?:boolean;onCheckedChange?:(v:boolean)=>void}){
  return(<button onClick={()=>onCheckedChange&&onCheckedChange(!checked)} className={"w-12 h-7 rounded-full p-1 transition "+(checked?"bg-slate-900":"bg-slate-300")} aria-pressed={checked}><div className={"w-5 h-5 bg-white rounded-full transition "+(checked?"translate-x-5":"")}></div></button>);
}
