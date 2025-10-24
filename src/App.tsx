
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const LS_KEYS = { tasks: "pomocheck_tasks_v1", settings: "pomocheck_settings_v1", log: "pomocheck_log_v1" };
const todayStr = () => { const d = new Date(); const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${yyyy}-${mm}-${dd}`; };
const formatMMSS = (s:number)=>{ s=Math.max(0,Math.floor(s)); const m=Math.floor(s/60); const r=s%60; return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}` };

type Task = { id: string; title: string; category: string; est: number; donePoms: number; completed: boolean };
const uid = () => Math.random().toString(36).slice(2,10);
const DEFAULT_SETTINGS = { workMin:25, shortBreakMin:5, longBreakMin:15, longBreakEvery:4, autoStartNext:true, notifyOnComplete:true };

export default function App(){
  const [settings,setSettings]=useState(()=>{ try{return JSON.parse(localStorage.getItem(LS_KEYS.settings)!)||DEFAULT_SETTINGS;}catch{return DEFAULT_SETTINGS;} });
  const [tasks,setTasks]=useState<Task[]>(()=>{ try{const s=JSON.parse(localStorage.getItem(LS_KEYS.tasks)!); return Array.isArray(s)?s:[];}catch{return [];} });
  const [log,setLog]=useState<any[]>(()=>{ try{const s=JSON.parse(localStorage.getItem(LS_KEYS.log)!); return Array.isArray(s)?s:[];}catch{return [];} });
  const [mode,setMode]=useState<'work'|'short'|'long'>('work');
  const [secondsLeft,setSecondsLeft]=useState(settings.workMin*60);
  const [isRunning,setIsRunning]=useState(false);
  const [activeTaskId,setActiveTaskId]=useState<string|null>(null);
  const intervalRef=useRef<any>(null);

  useEffect(()=>localStorage.setItem(LS_KEYS.settings,JSON.stringify(settings)),[settings]);
  useEffect(()=>localStorage.setItem(LS_KEYS.tasks,JSON.stringify(tasks)),[tasks]);
  useEffect(()=>localStorage.setItem(LS_KEYS.log,JSON.stringify(log)),[log]);

  useEffect(()=>{(async()=>{try{if(Capacitor.isNativePlatform())await LocalNotifications.requestPermissions();else if('Notification'in window&&(Notification as any).permission==='default')(Notification as any).requestPermission?.();}catch{}})()},[]);

  useEffect(()=>{ if(!isRunning)return; intervalRef.current=setInterval(()=>{setSecondsLeft(p=>{ if(p<=1){ clearInterval(intervalRef.current); setIsRunning(false); onSessionComplete(); return 0;} return p-1; });},1000); return ()=>clearInterval(intervalRef.current); },[isRunning]);

  useEffect(()=>{ if(mode==='work')setSecondsLeft(settings.workMin*60); if(mode==='short')setSecondsLeft(settings.shortBreakMin*60); if(mode==='long')setSecondsLeft(settings.longBreakMin*60); },[mode,settings]);

  const activeTask = tasks.find(t=>t.id===activeTaskId) || null;

  const notify=async(title:string,body:string)=>{ try{ if(!settings.notifyOnComplete) return; if(!Capacitor.isNativePlatform()&&'Notification'in window&&(Notification as any).permission==='granted'){ new Notification(title,{body}); return; } if(Capacitor.isNativePlatform()){ await LocalNotifications.schedule({notifications:[{title,body,id:Math.floor(Math.random()*100000),schedule:{ at: new Date(Date.now()+100)}}]}); } }catch{} };
  const onSessionComplete=()=>{
    const cat = activeTask?.category || '其他';
    if(mode==='work'){
      if(activeTask){ setTasks(p=>p.map(t=>t.id===activeTask.id?{...t,donePoms:(t.donePoms||0)+1,completed:(t.donePoms+1)>=(t.est||1)?true:t.completed}:t)); }
      setLog(p=>[...p,{ id: uid(), date: todayStr(), seconds: settings.workMin*60, category: cat }]);
      notify('番茄完成',`已完成 1 个番茄（${cat}）`);
      setMode('short');
      setSecondsLeft(settings.shortBreakMin*60);
      if(settings.autoStartNext) setIsRunning(true);
    } else {
      setMode('work');
      setSecondsLeft(settings.workMin*60);
      if(settings.autoStartNext) setIsRunning(true);
    }
  };

  const addTask=(title:string,category:string,est:number)=>{ if(!title) return; setTasks(p=>[{ id: uid(), title, category, est: Math.max(1,Number(est)||1), donePoms: 0, completed: false }, ...p]); };
  const removeTask=(id:string)=>setTasks(p=>p.filter(t=>t.id!==id));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-2 rounded-2xl bg-slate-900 text-white shadow">
            <img src="/src/assets/icon-book-dumbbell.svg" alt="icon" className="w-5 h-5" />
          </motion.div>
          <h1 className="text-2xl font-bold">正能量打卡</h1>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">番茄钟</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="w-60 h-60 rounded-full bg-slate-100 shadow-inner flex items-center justify-center">
                <div className="text-5xl font-bold tabular-nums">{formatMMSS(secondsLeft)}</div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Button onClick={()=>setIsRunning(r=>!r)}>{isRunning?'暂停':'开始'}</Button>
                <Button variant="secondary" onClick={()=>{setIsRunning(false); if(mode==='work')setSecondsLeft(settings.workMin*60); if(mode==='short')setSecondsLeft(settings.shortBreakMin*60); if(mode==='long')setSecondsLeft(settings.longBreakMin*60);}}>重置</Button>
                <Button variant="outline" onClick={()=>{setIsRunning(false); onSessionComplete();}}>跳过</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">添加任务</CardTitle></CardHeader>
            <CardContent>
              <QuickAdd onAdd={addTask} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">任务列表</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((t)=>(
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border">
                    <div>
                      <div className={'font-medium '+(t.completed?'line-through text-slate-400':'')}>{t.title} <Badge className="ml-2">{t.category}</Badge></div>
                      <div className="text-xs text-slate-500">预计 {t.est||1} 🍅 · 已完成 {t.donePoms||0} 🍅</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={()=>removeTask(t.id)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
                {tasks.length===0 && <p className="text-sm text-slate-500">暂无任务</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAdd({ onAdd }:{ onAdd:(title:string,category:string,est:number)=>void }){
  const [title,setTitle]=useState('');
  const [category,setCategory]=useState('学习');
  const [est,setEst]=useState(1);
  return (
    <div className="flex gap-2 items-center">
      <Input placeholder="例如：单词本 / 深蹲 3 组" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') onAdd(title,category,est)}}/>
      <select className="h-10 px-2 rounded-xl border border-slate-300" value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="学习">学习</option><option value="健身">健身</option><option value="其他">其他</option>
      </select>
      <Input type="number" className="w-20" min={1} value={est} onChange={e=>setEst(Number(e.target.value))}/>
      <Button onClick={()=>onAdd(title,category,est)}><Plus className="w-4 h-4 mr-1"/>添加</Button>
    </div>
  );
}
