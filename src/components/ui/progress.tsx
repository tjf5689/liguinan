
import React from "react"; export function Progress({value=0}:{value?:number}){return(<div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-2 bg-slate-900" style={{width:Math.max(0,Math.min(100,value))+"%"}}></div></div>);}
