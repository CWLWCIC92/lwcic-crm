import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://moyhcebdltdnfxdbbxvs.supabase.co",
  "sb_publishable_0q60uasG4FBzQbxNnqG8Yw_PTRYJNZO"
);

// ─── Fonts & Global Styles ────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'DM Sans',sans-serif;background:#f0f4f9;}
    ::-webkit-scrollbar{width:6px;}
    ::-webkit-scrollbar-thumb{background:#c5d0e0;border-radius:3px;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
    .fade-in{animation:fadeIn 0.25s ease forwards;}
    .slide-in{animation:slideIn 0.2s ease forwards;}
    @media print {
      body * { visibility: hidden !important; }
      #print-statement, #print-statement * { visibility: visible !important; }
      #print-statement { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; z-index: 9999 !important; }
    }
    #print-statement { display: none; }
    .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;transition:all 0.15s;font-size:14px;font-weight:500;color:#a8bcd4;border:none;background:transparent;width:100%;text-align:left;}
    .nav-item:hover{background:rgba(255,255,255,0.08);color:#e0eaf5;}
    .nav-item.active{background:rgba(255,255,255,0.15);color:#fff;font-weight:600;}
    .card{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);}
    .member-row{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid #f0f4f9;cursor:pointer;transition:background 0.12s;}
    .member-row:last-child{border-bottom:none;}
    .member-row:hover{background:#f6f9ff;}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid;}
    .tab-btn{flex:1;padding:9px 12px;border-radius:8px;border:none;font-weight:600;font-size:13px;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
    .field-input{width:100%;padding:9px 11px;border-radius:8px;border:1.5px solid #dde3ed;font-size:14px;font-family:'DM Sans',sans-serif;transition:border 0.15s;background:#fff;color:#1a2540;}
    .field-input:focus{outline:none;border-color:#2E75B6;}
    .btn-primary{background:#1B4F8A;color:#fff;border:none;padding:10px 22px;border-radius:9px;font-weight:600;font-size:14px;cursor:pointer;transition:background 0.15s;font-family:'DM Sans',sans-serif;}
    .btn-primary:hover{background:#163f6e;}
    .btn-ghost{background:transparent;color:#666;border:1.5px solid #dde3ed;padding:9px 18px;border-radius:9px;font-weight:500;font-size:14px;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
    .btn-ghost:hover{border-color:#aab;color:#333;background:#f7f9fc;}
    .btn-danger{background:transparent;color:#c62828;border:1.5px solid #ef9a9a;padding:9px 18px;border-radius:9px;font-weight:500;font-size:14px;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
    .btn-danger:hover{background:#fce4ec;}
    .stat-card{background:#fff;border-radius:14px;padding:18px 22px;box-shadow:0 2px 10px rgba(0,0,0,0.06);}
    .check-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f0f4f9;transition:background 0.12s;}
    .check-row:last-child{border-bottom:none;}
    .check-row:hover{background:#f6f9ff;}
    .giving-row{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #f0f4f9;transition:background 0.12s;}
    .giving-row:last-child{border-bottom:none;}
    .giving-row:hover{background:#f6f9ff;}
    .cal-day{min-height:80px;border:1px solid #e8eef6;border-radius:8px;padding:6px;cursor:pointer;transition:background 0.12s;background:#fff;}
    .cal-day:hover{background:#f6f9ff;}
    .cal-day.today{border-color:#2E75B6;background:#eff6ff;}
    .cal-day.other-month{background:#f8fafc;opacity:0.6;}
    .cal-event{font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .msg-row{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-bottom:1px solid #f0f4f9;transition:background 0.12s;}
    .msg-row:last-child{border-bottom:none;}
    .msg-row:hover{background:#f6f9ff;}
  `}</style>
);

// ─── Seed Data ────────────────────────────────────────────────────────────────
const initialMembers = [
  {id:1,firstName:"William",lastName:"Baldwin",role:"Pastor",status:"Member",phone:"(412) 555-0101",email:"cw@livingwatercic.org",address:"123 Main Street",address2:"",city:"McKees Rocks",state:"PA",zip:"15136",birthday:"1970-05-14",anniversary:"1995-08-20",joinDate:"2010-01-01",membershipClass:true,baptized:true,baptismDate:"1988-06-12",saved:true,savedDate:"1987-03-05",groups:["Leadership","Pastoral Team"],volunteerRoles:["Pastor","Preaching"],visitorSource:"Founded",notes:"Senior Pastor & Founder",photo:null,family:"Baldwin"},
  {id:2,firstName:"Lisa",lastName:"Baldwin",role:"Co-Pastor",status:"Member",phone:"(412) 555-0102",email:"lisa@livingwatercic.org",address:"123 Main Street",address2:"",city:"McKees Rocks",state:"PA",zip:"15136",birthday:"1972-09-03",anniversary:"1995-08-20",joinDate:"2010-01-01",membershipClass:true,baptized:true,baptismDate:"1990-04-01",saved:true,savedDate:"1989-07-14",groups:["Leadership","Pastoral Team","Women's Ministry"],volunteerRoles:["Co-Pastor","Teaching"],visitorSource:"Founded",notes:"Co-Pastor & Founder",photo:null,family:"Baldwin"},
  {id:3,firstName:"Kimberly",lastName:"Battles",role:"Member",status:"Member",phone:"(412) 555-0103",email:"kbattles@email.com",address:"456 Oak Avenue",address2:"Apt 2B",city:"Pittsburgh",state:"PA",zip:"15219",birthday:"1985-11-22",anniversary:"",joinDate:"2018-03-15",membershipClass:true,baptized:true,baptismDate:"2018-05-20",saved:true,savedDate:"2018-03-15",groups:["Women's Ministry","Prayer Team"],volunteerRoles:["Usher"],visitorSource:"Friend",notes:"Faithful tither. Very involved.",photo:null,family:"Battles"},
  {id:4,firstName:"Warren",lastName:"Baker",role:"Deacon",status:"Member",phone:"(412) 555-0104",email:"wbaker@email.com",address:"789 Church Street",address2:"",city:"McKees Rocks",state:"PA",zip:"15136",birthday:"1975-02-08",anniversary:"2002-06-14",joinDate:"2015-09-01",membershipClass:true,baptized:true,baptismDate:"2015-10-11",saved:true,savedDate:"2015-09-01",groups:["Leadership","Men's Ministry"],volunteerRoles:["Deacon","Sound Booth"],visitorSource:"Community Outreach",notes:"Deacon. Handles Sunday sound.",photo:null,family:"Baker"},
  {id:5,firstName:"Deborah",lastName:"Jones",role:"Member",status:"Member",phone:"(412) 555-0105",email:"djones@email.com",address:"321 Elm Street",address2:"",city:"Pittsburgh",state:"PA",zip:"15221",birthday:"1960-07-19",anniversary:"1984-10-05",joinDate:"2012-06-10",membershipClass:true,baptized:true,baptismDate:"2012-08-05",saved:true,savedDate:"2012-06-10",groups:["Women's Ministry","Hospitality"],volunteerRoles:["Hospitality","Kitchen"],visitorSource:"Family",notes:"Hospitality ministry lead.",photo:null,family:"Jones"},
];

const initialGiving = [
  {id:1,memberId:1,date:"2026-03-02",amount:200,method:"Check",category:"Tithe",note:""},
  {id:2,memberId:2,date:"2026-03-02",amount:200,method:"Check",category:"Tithe",note:""},
  {id:3,memberId:3,date:"2026-03-02",amount:150,method:"Cash App",category:"Tithe",note:""},
  {id:4,memberId:4,date:"2026-03-02",amount:100,method:"Cash",category:"Offering",note:""},
  {id:5,memberId:5,date:"2026-03-02",amount:75,method:"Stripe",category:"Tithe",note:""},
  {id:6,memberId:1,date:"2026-02-23",amount:200,method:"Check",category:"Tithe",note:""},
  {id:7,memberId:3,date:"2026-02-23",amount:150,method:"Cash App",category:"Tithe",note:""},
  {id:8,memberId:2,date:"2026-02-23",amount:50,method:"Cash",category:"Love Offering",note:"Guest speaker"},
  {id:9,memberId:5,date:"2026-02-16",amount:75,method:"Stripe",category:"Tithe",note:""},
  {id:10,memberId:4,date:"2026-02-16",amount:100,method:"Cash",category:"Offering",note:""},
  {id:11,memberId:1,date:"2026-02-16",amount:200,method:"Check",category:"Tithe",note:""},
  {id:12,memberId:3,date:"2026-02-09",amount:150,method:"Cash App",category:"Tithe",note:""},
];

const initialAttendance = [
  {date:"2026-03-02",present:[1,2,3,4,5]},
  {date:"2026-02-23",present:[1,2,3,5]},
  {date:"2026-02-16",present:[1,2,4,5]},
  {date:"2026-02-09",present:[1,2,3,4]},
];

// Phase 3 seed data
const initialGroups = [
  {id:1,name:"Leadership",description:"Church leadership team",leaderId:1,color:"#1B4F8A",members:[{memberId:1,groupRole:"Leader"},{memberId:2,groupRole:"Leader"},{memberId:4,groupRole:"Member"}]},
  {id:2,name:"Pastoral Team",description:"Pastor and Co-Pastor ministry team",leaderId:1,color:"#2E75B6",members:[{memberId:1,groupRole:"Leader"},{memberId:2,groupRole:"Member"}]},
  {id:3,name:"Women's Ministry",description:"Women's fellowship and Bible study",leaderId:2,color:"#880E4F",members:[{memberId:2,groupRole:"Leader"},{memberId:3,groupRole:"Member"},{memberId:5,groupRole:"Member"}]},
  {id:4,name:"Men's Ministry",description:"Men's fellowship and accountability",leaderId:4,color:"#2e7d32",members:[{memberId:4,groupRole:"Leader"}]},
  {id:5,name:"Prayer Team",description:"Intercession and prayer ministry",leaderId:3,color:"#7B1FA2",members:[{memberId:3,groupRole:"Leader"},{memberId:2,groupRole:"Member"}]},
  {id:6,name:"Hospitality",description:"Sunday hospitality and kitchen ministry",leaderId:5,color:"#E65100",members:[{memberId:5,groupRole:"Leader"}]},
];

const initialEvents = [
  {id:1,title:"Sunday Morning Worship",date:"2026-03-08",time:"10:00",endTime:"12:00",location:"Sanctuary",groupId:null,type:"Church-Wide",description:"Weekly Sunday service",color:"#1B4F8A"},
  {id:2,title:"Women's Bible Study",date:"2026-03-10",time:"18:30",endTime:"20:00",location:"Fellowship Hall",groupId:3,type:"Group",description:"Weekly women's Bible study and fellowship",color:"#880E4F"},
  {id:3,title:"Men's Breakfast",date:"2026-03-14",time:"08:00",endTime:"10:00",location:"Fellowship Hall",groupId:4,type:"Group",description:"Monthly men's fellowship breakfast",color:"#2e7d32"},
  {id:4,title:"Sunday Morning Worship",date:"2026-03-15",time:"10:00",endTime:"12:00",location:"Sanctuary",groupId:null,type:"Church-Wide",description:"Weekly Sunday service",color:"#1B4F8A"},
  {id:5,title:"Prayer Service",date:"2026-03-18",time:"19:00",endTime:"20:30",location:"Sanctuary",groupId:5,type:"Group",description:"Midweek prayer and intercession",color:"#7B1FA2"},
  {id:6,title:"Leadership Meeting",date:"2026-03-21",time:"14:00",endTime:"16:00",location:"Conference Room",groupId:1,type:"Group",description:"Monthly leadership planning meeting",color:"#2E75B6"},
  {id:7,title:"Sunday Morning Worship",date:"2026-03-22",time:"10:00",endTime:"12:00",location:"Sanctuary",groupId:null,type:"Church-Wide",description:"Weekly Sunday service",color:"#1B4F8A"},
  {id:8,title:"Easter Sunday Celebration",date:"2026-04-05",time:"10:00",endTime:"13:00",location:"Sanctuary",groupId:null,type:"Church-Wide",description:"Special Easter Sunday service and celebration",color:"#f57f17"},
];

const initialMessages = [
  {id:1,sentBy:1,to:"All Members",toGroup:null,type:"Email",subject:"Sunday Service Reminder",body:"Join us this Sunday at 10am for worship and the Word. We look forward to seeing you!",date:"2026-03-01",channel:"Email"},
  {id:2,sentBy:2,to:"Women's Ministry",toGroup:3,type:"SMS",subject:"",body:"Ladies, don't forget Bible study this Tuesday at 6:30pm. See you there! — Pastor Lisa",date:"2026-03-03",channel:"SMS"},
  {id:3,sentBy:1,to:"All Members",toGroup:null,type:"Email",subject:"Easter Sunday is Coming!",body:"Mark your calendars — Easter Sunday, April 5th at 10am. Bring your family and invite a friend. He is risen!",date:"2026-03-05",channel:"Email"},
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES  = ["Member","Visitor","Inactive","Transferred"];
const ROLES     = ["Pastor","Co-Pastor","Deacon","Elder","Minister","Member","Visitor"];
const GROUP_NAMES = ["Leadership","Pastoral Team","Men's Ministry","Women's Ministry","Youth","Prayer Team","Hospitality","Sound Booth","Worship Team"];
const SOURCES   = ["Founded","Friend","Family","Community Outreach","Social Media","Walk-in","Online Search","Other"];
const METHODS   = ["Cash","Check","Cash App","Zelle","Stripe"];
const CATEGORIES= ["Tithe","Offering","Love Offering","Missions","Building Fund","Other"];
const EVENT_TYPES = ["Church-Wide","Group","Special"];
const GROUP_ROLES = ["Leader","Co-Leader","Secretary","Member"];
const VOLUNTEER_ROLES = ["Pastor","Co-Pastor","Deacon","Elder","Usher","Sound Booth","Worship","Teaching","Hospitality","Kitchen","Preaching","Prayer","Children's Ministry","Youth Ministry","Other"];
const GROUP_COLORS = ["#1B4F8A","#2E75B6","#4CAF50","#7B1FA2","#00897B","#E65100","#880E4F","#37474F","#f57f17","#c62828"];

const STATUS_COLORS = {Member:{bg:"#e8f5e9",text:"#2e7d32",border:"#a5d6a7"},Visitor:{bg:"#fff8e1",text:"#f57f17",border:"#ffe082"},Inactive:{bg:"#fce4ec",text:"#c62828",border:"#ef9a9a"},Transferred:{bg:"#e8eaf6",text:"#283593",border:"#9fa8da"}};
const ROLE_COLORS = {Pastor:"#1B4F8A","Co-Pastor":"#2E75B6",Deacon:"#4CAF50",Elder:"#7B1FA2",Minister:"#00897B",Member:"#546E7A",Visitor:"#F57C00"};
const AVATAR_COLORS = ["#1B4F8A","#2E75B6","#4CAF50","#7B1FA2","#00897B","#E65100","#880E4F","#37474F"];
const METHOD_COLORS = {Cash:"#2e7d32",Check:"#1B4F8A","Cash App":"#00897B",Zelle:"#6a1b9a",Stripe:"#7c4dff"};

const blankMember = () => ({firstName:"",lastName:"",role:"Member",status:"Member",phone:"",email:"",address:"",address2:"",city:"",state:"PA",zip:"",family:"",birthday:"",anniversary:"",joinDate:new Date().toISOString().split("T")[0],visitorSource:"Friend",saved:false,savedDate:"",baptized:false,baptismDate:"",membershipClass:false,volunteerRoles:[],groups:[],notes:"",photo:null});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = d => {if(!d)return"—";const[y,m,dy]=d.split("-");return new Date(+y,+m-1,+dy).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});};
const fmtTime = t => {if(!t)return"";const[h,m]=t.split(":");const ap=+h>=12?"PM":"AM";return`${+h%12||12}:${m}${ap}`;};
const dollar  = n => `$${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const todayStr= () => new Date().toISOString().split("T")[0];
const isoWeek = d => {const dt=new Date(d);dt.setHours(0,0,0,0);dt.setDate(dt.getDate()-dt.getDay());return dt.toISOString().split("T")[0];};

function getUpcomingBirthdays(members,days=30){
  const today=new Date();
  return members.filter(m=>{
    if(!m.birthday)return false;
    const[,mo,dy]=m.birthday.split("-").map(Number);
    const next=new Date(today.getFullYear(),mo-1,dy);
    if(next<today)next.setFullYear(today.getFullYear()+1);
    return(next-today)/86400000<=days;
  }).sort((a,b)=>{
    const n=bday=>{const t=new Date();const[,mo,dy]=bday.split("-").map(Number);const nx=new Date(t.getFullYear(),mo-1,dy);if(nx<t)nx.setFullYear(t.getFullYear()+1);return nx-t;};
    return n(a.birthday)-n(b.birthday);
  });
}
function getMissedSundays(memberId,attendance){
  const sorted=[...attendance].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  let missed=0;
  for(const s of sorted){if(s.present.includes(memberId))break;missed++;}
  return missed>=2;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Avatar({member,size=44}){
  const initials=`${member?.firstName?.[0] || member?.first_name?.[0] || "?"}${member?.lastName?.[0] || member?.last_name?.[0] || "?"}`;
  const color=AVATAR_COLORS[member.id%AVATAR_COLORS.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.33,fontWeight:700,fontFamily:"'Playfair Display',serif",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}>{initials}</div>;
}
function StatusBadge({status}){const c=STATUS_COLORS[status]||STATUS_COLORS.Member;return <span className="badge" style={{background:c.bg,color:c.text,borderColor:c.border}}>{status}</span>;}
function RolePip({role}){const color=ROLE_COLORS[role]||"#546E7A";return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color}}><span style={{width:7,height:7,borderRadius:"50%",background:color,display:"inline-block"}}/>{role}</span>;}
function FieldBlock({label,value}){return <div><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{label}</div><div style={{fontSize:14,color:"#1e293b",fontWeight:500}}>{value||"—"}</div></div>;}
function SectionHeader({emoji,title}){return <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#0d2d5e",marginBottom:18,display:"flex",alignItems:"center",gap:8}}><span>{emoji}</span>{title}</div>;}
function GroupDot({color,size=10}){return <span style={{width:size,height:size,borderRadius:"50%",background:color,display:"inline-block",flexShrink:0}}/>;}

function ConfirmModal({message,onConfirm,onCancel}){
  return <div style={{position:"fixed",inset:0,background:"rgba(10,20,40,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
    <div className="card fade-in" style={{padding:"32px 36px",maxWidth:380,width:"90%",textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
      <div style={{fontSize:16,color:"#1e293b",fontWeight:600,marginBottom:8}}>Are you sure?</div>
      <div style={{fontSize:14,color:"#64748b",marginBottom:28,lineHeight:1.6}}>{message}</div>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Yes, Remove</button>
      </div>
    </div>
  </div>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  {key:"dashboard",icon:"🏠",label:"Dashboard"},
  {key:"members",  icon:"👥",label:"People & Families"},
  {key:"giving",   icon:"💰",label:"Giving"},
  {key:"attendance",icon:"📋",label:"Attendance"},
  {key:"groups",   icon:"⛪",label:"Groups & Ministries"},
  {key:"comms",    icon:"📨",label:"Communications"},
  {key:"calendar", icon:"📅",label:"Events & Calendar"},
  {key:"reminders",icon:"🔔",label:"Auto-Reminders"},
  {key:"reports",  icon:"📊",label:"Reports & Export"},
];

function Sidebar({active,onNav,onLogout}){
  return <div style={{width:230,flexShrink:0,background:"linear-gradient(175deg,#0d2d5e 0%,#1B4F8A 100%)",display:"flex",flexDirection:"column",padding:"0 10px 20px",boxShadow:"4px 0 20px rgba(0,0,0,0.12)"}}>
    <div style={{padding:"24px 10px 20px",borderBottom:"1px solid rgba(255,255,255,0.1)",marginBottom:12}}>
      <div style={{fontFamily:"'Playfair Display',serif",color:"#fff",fontSize:16,fontWeight:800,lineHeight:1.3}}>Living Water<br/>Church In Christ</div>
      <div style={{fontSize:10,color:"#89a8cc",marginTop:4,letterSpacing:1,textTransform:"uppercase"}}>Leadership Portal</div>
    </div>
    <nav style={{flex:1,overflowY:"auto"}}>
      {NAV.map(n=>(
        <button key={n.key} className={`nav-item${active===n.key?" active":""}`}
          onClick={()=>!n.soon&&onNav(n.key)}
          style={{opacity:n.soon?0.5:1,cursor:n.soon?"default":"pointer"}}>
          <span style={{fontSize:16}}>{n.icon}</span>
          <span>{n.label}</span>
          {n.soon&&<span style={{marginLeft:"auto",fontSize:9,background:"rgba(255,255,255,0.15)",color:"#c5d9f0",padding:"2px 6px",borderRadius:8}}>SOON</span>}
        </button>
      ))}
    </nav>
    <div style={{padding:"14px 10px 0",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
      <div style={{fontSize:11,color:"#6a8caf",lineHeight:1.5}}>McKees Rocks, PA<br/><span style={{color:"#4a7ab5"}}>Phase 3 — Active</span></div>
      <button onClick={onLogout} style={{marginTop:16,width:"100%",padding:"8px",background:"rgba(255,255,255,0.1)",color:"#a8bcd4",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,fontSize:13,cursor:"pointer"}}>Sign Out</button>
    </div>
  </div>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({members,giving,attendance,groups,events,onNav}){
  const today=new Date();
  const thisMonth=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  const monthlyTotal=giving.filter(g=>g.date.startsWith(thisMonth)).reduce((s,g)=>s+g.amount,0);
  const yearlyTotal=giving.filter(g=>g.date.startsWith(`${today.getFullYear()}`)).reduce((s,g)=>s+g.amount,0);
  const lastService=attendance.length?[...attendance].sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0]:null;
  const attRate=lastService?(lastService.present.length/members.filter(m=>m.status==="Member").length*100).toFixed(0):0;
  const upcoming=getUpcomingBirthdays(members,30);
  const missed=members.filter(m=>getMissedSundays(m.id,attendance));
  const upcomingEvents=[...events].filter(e=>e.date>=todayStr()).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).slice(0,4);

  return <div className="fade-in">
    <div style={{marginBottom:28}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:800,color:"#0d2d5e"}}>Good day, Pastor Baldwin 👋</div>
      <div style={{fontSize:14,color:"#64748b",marginTop:4}}>{today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
      {[["👥","Total People",members.length,"#1B4F8A"],["💰","Monthly Giving",dollar(monthlyTotal),"#2e7d32"],["📈","Yearly Giving",dollar(yearlyTotal),"#00897B"],["📋","Last Sunday",`${attRate}%`,"#f57f17"]].map(([icon,label,val,color])=>(
        <div key={label} className="stat-card" style={{borderTop:`4px solid ${color}`}}>
          <div style={{fontSize:26,marginBottom:6}}>{icon}</div>
          <div style={{fontSize:val.toString().length>6?22:30,fontWeight:800,color,fontFamily:"'Playfair Display',serif"}}>{val}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:2}}>{label}</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Upcoming Events */}
      <div className="card" style={{padding:22}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#0d2d5e",marginBottom:16}}>📅 Upcoming Events</div>
        {upcomingEvents.length===0?<div style={{color:"#94a3b8",fontSize:14}}>No upcoming events.</div>:
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {upcomingEvents.map(e=>(
              <div key={e.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{background:e.color,borderRadius:8,padding:"4px 8px",textAlign:"center",minWidth:40,flexShrink:0}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontWeight:600}}>{new Date(e.date+"T12:00").toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</div>
                  <div style={{fontSize:16,color:"#fff",fontWeight:800,lineHeight:1}}>{new Date(e.date+"T12:00").getDate()}</div>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{e.title}</div>
                  <div style={{fontSize:12,color:"#64748b"}}>{fmtTime(e.time)} · {e.location}</div>
                </div>
              </div>
            ))}
          </div>}
        <button className="btn-ghost" onClick={()=>onNav("calendar")} style={{marginTop:14,width:"100%",textAlign:"center",fontSize:13}}>View Calendar →</button>
      </div>
      {/* Birthdays & Alerts */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div className="card" style={{padding:22,flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#0d2d5e",marginBottom:12}}>🎂 Birthdays <span style={{fontSize:12,color:"#94a3b8",fontWeight:400}}>(30 days)</span></div>
          {upcoming.length===0?<div style={{color:"#94a3b8",fontSize:14}}>None upcoming.</div>:upcoming.slice(0,3).map(m=>{const[,mo,dy]=m.birthday.split("-").map(Number);const ds=new Date(2000,mo-1,dy).toLocaleDateString("en-US",{month:"short",day:"numeric"});return(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Avatar member={m} size={30}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{m.firstName} {m.lastName}</div><div style={{fontSize:11,color:"#64748b"}}>{ds}</div></div></div>
          );})}
        </div>
        <div className="card" style={{padding:22,flex:1}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#0d2d5e",marginBottom:12}}>⚠️ Needs Follow-Up</div>
          {missed.length===0?<div style={{color:"#2e7d32",fontSize:14,fontWeight:500}}>✅ Everyone accounted for!</div>:missed.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Avatar member={m} size={30}/><div><div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{m.firstName} {m.lastName}</div><div style={{fontSize:11,color:"#c62828"}}>Missed 2+ Sundays</div></div></div>
          ))}
        </div>
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#0d2d5e",marginBottom:14}}>⚡ Quick Actions</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {[["💰 Log a Gift","giving"],["📋 Take Attendance","attendance"],["📨 Send Message","comms"],["📅 Add Event","calendar"],["👥 Add Member","members"]].map(([label,page])=>(
          <button key={label} className="btn-primary" onClick={()=>onNav(page)} style={{fontSize:13,padding:"9px 18px"}}>{label}</button>
        ))}
      </div>
    </div>
  </div>;
}

// ─── GROUPS MODULE ────────────────────────────────────────────────────────────
function GroupsModule({members,groups,onSaveGroup,onDeleteGroup,currentUser}){
  const [view,setView]=useState("list"); // list | detail | add | edit
  const [selected,setSelected]=useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null);
  const [form,setForm]=useState(null);

  const memberMap=useMemo(()=>Object.fromEntries(members.map(m=>[m.id,m])),[members]);
  const canManage=currentUser.role==="Pastor"||currentUser.role==="Co-Pastor";

  const blankGroup=()=>({name:"",description:"",leaderId:"",color:GROUP_COLORS[0],members:[]});

  const handleEdit=g=>{setForm({...g,members:[...g.members.map(m=>({...m}))]});setView("edit");};
  const handleAdd=()=>{setForm(blankGroup());setView("add");};

  const handleSave=()=>{
    if(!form.name.trim())return;
    onSaveGroup(form);
    setView("list");setSelected(null);setForm(null);
  };

  const toggleMember=(memberId)=>{
    setForm(f=>{
      const exists=f.members.find(m=>m.memberId===memberId);
      return exists?{...f,members:f.members.filter(m=>m.memberId!==memberId)}:{...f,members:[...f.members,{memberId,groupRole:"Member"}]};
    });
  };

  const setMemberRole=(memberId,groupRole)=>{
    setForm(f=>({...f,members:f.members.map(m=>m.memberId===memberId?{...m,groupRole}:m)}));
  };

  if(view==="list") return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>⛪ Groups & Ministries</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{groups.length} groups</div></div>
      {canManage&&<button className="btn-primary" onClick={handleAdd}>+ New Group</button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
      {groups.map(g=>{
        const leader=memberMap[g.leaderId];
        return <div key={g.id} className="card" style={{padding:22,cursor:"pointer",borderTop:`4px solid ${g.color}`,transition:"transform 0.12s,box-shadow 0.12s"}}
          onClick={()=>{setSelected(g);setView("detail");}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#0d2d5e"}}>{g.name}</div>
            <span style={{fontSize:11,fontWeight:700,color:g.color,background:`${g.color}18`,padding:"3px 10px",borderRadius:12}}>{g.members.length} member{g.members.length!==1?"s":""}</span>
          </div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:14,lineHeight:1.5}}>{g.description||"No description."}</div>
          {leader&&<div style={{display:"flex",alignItems:"center",gap:8}}>
            <Avatar member={leader} size={28}/>
            <div><div style={{fontSize:12,fontWeight:600,color:"#334155"}}>{leader.firstName} {leader.lastName}</div><div style={{fontSize:11,color:"#94a3b8"}}>Group Leader</div></div>
          </div>}
        </div>;
      })}
    </div>
  </div>;

  if(view==="detail"&&selected){
    const g=groups.find(x=>x.id===selected.id)||selected;
    const leader=memberMap[g.leaderId];
    const groupMembers=g.members.map(gm=>({...gm,member:memberMap[gm.memberId]})).filter(x=>x.member);
    const isLeader=currentUser.id===g.leaderId;
    const canEdit=canManage||isLeader;
    return <div className="fade-in" style={{maxWidth:720,margin:"0 auto"}}>
      <button className="btn-ghost" onClick={()=>{setView("list");setSelected(null);}} style={{marginBottom:16,padding:"7px 14px",fontSize:13}}>← Back to Groups</button>
      <div className="card" style={{padding:28,marginBottom:14,borderTop:`5px solid ${g.color}`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>{g.name}</div>
            <div style={{fontSize:14,color:"#64748b",marginTop:4}}>{g.description}</div>
            {leader&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
              <Avatar member={leader} size={32}/><div><div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{leader.firstName} {leader.lastName}</div><div style={{fontSize:11,color:"#94a3b8"}}>Group Leader</div></div>
            </div>}
          </div>
          {canEdit&&<div style={{display:"flex",gap:8}}>
            <button className="btn-primary" onClick={()=>handleEdit(g)}>✏️ Edit</button>
            {canManage&&<button className="btn-danger" onClick={()=>setDeleteTarget(g)}>🗑</button>}
          </div>}
        </div>
      </div>
      {/* Members */}
      <div className="card" style={{overflow:"hidden",marginBottom:14}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #f0f4f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#0d2d5e"}}>Members ({groupMembers.length})</div>
        </div>
        {groupMembers.length===0?<div style={{padding:24,textAlign:"center",color:"#94a3b8"}}>No members yet.</div>:
          groupMembers.map(({member,groupRole})=>(
            <div key={member.id} className="member-row" style={{cursor:"default"}}>
              <Avatar member={member} size={40}/>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{member.firstName} {member.lastName}</div><div style={{fontSize:12,color:"#64748b"}}>{member.role}</div></div>
              <span style={{fontSize:12,fontWeight:600,color:g.color,background:`${g.color}18`,padding:"3px 10px",borderRadius:12}}>{groupRole}</span>
              <StatusBadge status={member.status}/>
            </div>
          ))}
      </div>
      {/* Contact list */}
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="📞" title="Group Contact List"/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {groupMembers.map(({member})=>(
            <div key={member.id} style={{display:"flex",gap:16,padding:"8px 0",borderBottom:"1px solid #f0f4f9",fontSize:13}}>
              <div style={{fontWeight:600,color:"#1e293b",minWidth:150}}>{member.firstName} {member.lastName}</div>
              <div style={{color:"#64748b",flex:1}}>{member.phone||"—"}</div>
              <div style={{color:"#64748b",flex:2}}>{member.email||"—"}</div>
            </div>
          ))}
        </div>
      </div>
      {deleteTarget&&<ConfirmModal message={`Delete the "${deleteTarget.name}" group? This cannot be undone.`} onConfirm={()=>{onDeleteGroup(deleteTarget.id);setDeleteTarget(null);setView("list");setSelected(null);}} onCancel={()=>setDeleteTarget(null)}/>}
    </div>;
  }

  if(view==="add"||view==="edit") return <div className="fade-in" style={{maxWidth:680,margin:"0 auto"}}>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:"#0d2d5e",marginBottom:20}}>{view==="add"?"➕ New Group":"✏️ Edit Group"}</div>
    <div className="card" style={{padding:26,marginBottom:14}}>
      <SectionHeader emoji="⛪" title="Group Details"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Group Name *</label>
          <input className="field-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Women's Ministry"/>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Description</label>
          <input className="field-input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description of this group"/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Group Leader</label>
          <select className="field-input" value={form.leaderId} onChange={e=>setForm(f=>({...f,leaderId:+e.target.value}))}>
            <option value="">Select leader…</option>
            {[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=><option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Group Color</label>
          <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
            {GROUP_COLORS.map(c=><button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:form.color===c?"3px solid #1e293b":"2px solid transparent",cursor:"pointer"}}/>)}
          </div>
        </div>
      </div>
    </div>
    <div className="card" style={{padding:26,marginBottom:14}}>
      <SectionHeader emoji="👥" title="Members"/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=>{
          const inGroup=form.members.find(gm=>gm.memberId===m.id);
          return <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #f0f4f9"}}>
            <input type="checkbox" checked={!!inGroup} onChange={()=>toggleMember(m.id)} style={{width:16,height:16,accentColor:"#1B4F8A",cursor:"pointer"}}/>
            <Avatar member={m} size={32}/>
            <div style={{flex:1,fontSize:14,fontWeight:500,color:"#1e293b"}}>{m.firstName} {m.lastName}</div>
            {inGroup&&<select value={inGroup.groupRole} onChange={e=>setMemberRole(m.id,e.target.value)} className="field-input" style={{width:140}}>
              {GROUP_ROLES.map(r=><option key={r}>{r}</option>)}
            </select>}
          </div>;
        })}
      </div>
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
      <button className="btn-ghost" onClick={()=>{setView("list");setSelected(null);setForm(null);}}>Cancel</button>
      <button className="btn-primary" onClick={handleSave}>{view==="add"?"➕ Create Group":"💾 Save Changes"}</button>
    </div>
  </div>;

  return null;
}

// ─── COMMUNICATIONS MODULE ────────────────────────────────────────────────────
function CommsModule({members,groups,messages,onSendMessage,currentUser}){
  const [subView,setSubView]=useState("compose"); // compose | log
  const [form,setForm]=useState({channel:"Email",toType:"all",toGroup:"",toMember:"",subject:"",body:""});
  const [sent,setSent]=useState(false);
  const [errors,setErrors]=useState({});

  const canSendToAll=currentUser.role==="Pastor"||currentUser.role==="Co-Pastor";
  const myGroups=canSendToAll?groups:groups.filter(g=>g.leaderId===currentUser.id);
  const activeMembers=useMemo(()=>[...members].filter(m=>m.status==="Member"||m.status==="Visitor").sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")),[members]);

  const recipientCount=useMemo(()=>{
    if(form.toType==="all")return members.filter(m=>m.status==="Member").length;
    if(form.toType==="group"&&form.toGroup){
      const g=groups.find(x=>x.id===+form.toGroup);
      return g?g.members.length:0;
    }
    if(form.toType==="member"&&form.toMember)return 1;
    return 0;
  },[form,members,groups]);

  const getRecipientLabel=()=>{
    if(form.toType==="all")return"All Members";
    if(form.toType==="group"&&form.toGroup){
      const g=groups.find(x=>x.id===+form.toGroup);
      return g?g.name:"";
    }
    if(form.toType==="member"&&form.toMember){
      const m=members.find(x=>x.id===+form.toMember);
      return m?`${m.firstName} ${m.lastName}`:"";
    }
    return"";
  };

  const validate=()=>{
    const e={};
    if(form.toType==="group"&&!form.toGroup)e.toGroup="Select a group";
    if(form.toType==="member"&&!form.toMember)e.toMember="Select a member";
    if(form.channel==="Email"&&!form.subject.trim())e.subject="Subject required for emails";
    if(!form.body.trim())e.body="Message body required";
    return e;
  };

  const handleSend=()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    onSendMessage({
      channel:form.channel,
      to:getRecipientLabel(),
      toGroup:form.toType==="group"?+form.toGroup:null,
      subject:form.subject,
      body:form.body,
      sentBy:currentUser.id,
      date:todayStr(),
    });
    setSent(true);
    setErrors({});
    setTimeout(()=>{setSent(false);setForm({channel:"Email",toType:"all",toGroup:"",toMember:"",subject:"",body:""});},2500);
  };

  return <div className="fade-in">
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>📨 Communications</div>
      <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{messages.length} messages sent</div>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:18}}>
      {[["compose","✍️ Compose"],["log","📋 Message Log"]].map(([key,label])=>(
        <button key={key} className="tab-btn" onClick={()=>setSubView(key)}
          style={{background:subView===key?"#1B4F8A":"#fff",color:subView===key?"#fff":"#64748b",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",flex:"none",padding:"9px 20px"}}>
          {label}
        </button>
      ))}
    </div>

    {subView==="compose"&&<div className="slide-in" style={{maxWidth:680}}>
      <div className="card" style={{padding:28}}>
        <SectionHeader emoji="✍️" title="New Message"/>

        {/* Channel toggle */}
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.6}}>Send Via</label>
          <div style={{display:"flex",gap:0,borderRadius:9,overflow:"hidden",border:"1.5px solid #dde3ed",width:"fit-content"}}>
            {["Email","SMS"].map(ch=>(
              <button key={ch} onClick={()=>setForm(f=>({...f,channel:ch}))} style={{padding:"9px 28px",border:"none",background:form.channel===ch?"#1B4F8A":"#fff",color:form.channel===ch?"#fff":"#64748b",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
                {ch==="Email"?"📧 Email":"📱 SMS"}
              </button>
            ))}
          </div>
        </div>

        {/* To */}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.6}}>To</label>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {canSendToAll&&<button onClick={()=>setForm(f=>({...f,toType:"all",toGroup:"",toMember:""}))} style={{padding:"7px 16px",borderRadius:20,fontSize:13,cursor:"pointer",fontWeight:600,background:form.toType==="all"?"#1B4F8A":"#f1f5f9",color:form.toType==="all"?"#fff":"#475569",border:form.toType==="all"?"1px solid #1B4F8A":"1px solid #cbd5e1"}}>🌍 All Members</button>}
            <button onClick={()=>setForm(f=>({...f,toType:"group",toMember:""}))} style={{padding:"7px 16px",borderRadius:20,fontSize:13,cursor:"pointer",fontWeight:600,background:form.toType==="group"?"#1B4F8A":"#f1f5f9",color:form.toType==="group"?"#fff":"#475569",border:form.toType==="group"?"1px solid #1B4F8A":"1px solid #cbd5e1"}}>⛪ Specific Group</button>
            <button onClick={()=>setForm(f=>({...f,toType:"member",toGroup:""}))} style={{padding:"7px 16px",borderRadius:20,fontSize:13,cursor:"pointer",fontWeight:600,background:form.toType==="member"?"#1B4F8A":"#f1f5f9",color:form.toType==="member"?"#fff":"#475569",border:form.toType==="member"?"1px solid #1B4F8A":"1px solid #cbd5e1"}}>👤 Individual</button>
          </div>
          {form.toType==="group"&&<div>
            <select className="field-input" value={form.toGroup} onChange={e=>setForm(f=>({...f,toGroup:e.target.value}))} style={{borderColor:errors.toGroup?"#c62828":undefined}}>
              <option value="">Select group…</option>
              {myGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            {errors.toGroup&&<div style={{fontSize:11,color:"#c62828",marginTop:3}}>{errors.toGroup}</div>}
          </div>}
          {form.toType==="member"&&<div>
            <select className="field-input" value={form.toMember} onChange={e=>setForm(f=>({...f,toMember:e.target.value}))} style={{borderColor:errors.toMember?"#c62828":undefined}}>
              <option value="">Select member…</option>
              {activeMembers.map(m=><option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>)}
            </select>
            {errors.toMember&&<div style={{fontSize:11,color:"#c62828",marginTop:3}}>{errors.toMember}</div>}
          </div>}
          {recipientCount>0&&<div style={{marginTop:8,fontSize:12,color:"#2e7d32",fontWeight:600}}>✓ {recipientCount} recipient{recipientCount!==1?"s":""} will receive this message</div>}
        </div>

        {/* Subject (email only) */}
        {form.channel==="Email"&&<div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:errors.subject?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Subject{errors.subject&&<span style={{color:"#c62828"}}> — {errors.subject}</span>}</label>
          <input className="field-input" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="e.g. Sunday Service Reminder" style={{borderColor:errors.subject?"#c62828":undefined}}/>
        </div>}

        {/* Body */}
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,color:errors.body?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>
            Message{form.channel==="SMS"?` (${form.body.length}/160 chars)`:""}
            {errors.body&&<span style={{color:"#c62828"}}> — {errors.body}</span>}
          </label>
          <textarea className="field-input" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
            rows={form.channel==="SMS"?4:7} maxLength={form.channel==="SMS"?160:undefined}
            placeholder={form.channel==="SMS"?"Type your text message (max 160 characters)…":"Type your email message here…"}
            style={{resize:"vertical",borderColor:errors.body?"#c62828":undefined}}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <button className="btn-primary" onClick={handleSend} style={{minWidth:160,background:sent?"#2e7d32":undefined}}>
            {sent?`✅ ${form.channel} Sent!`:`📤 Send ${form.channel}`}
          </button>
          <div style={{fontSize:12,color:"#94a3b8"}}>
            {sent
              ? `Logged to Message Log — will deliver via ${form.channel==="Email"?"SendGrid":"Twilio"} once connected in Phase 5`
              : form.channel==="Email"?"Will send via SendGrid (Phase 5)":"Will send via Twilio SMS (Phase 5)"}
          </div>
        </div>
      </div>
    </div>}

    {subView==="log"&&<div className="slide-in">
      <div className="card" style={{overflow:"hidden"}}>
        {messages.length===0?<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>📭</div>No messages sent yet.</div>:
          [...messages].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(msg=>{
            const sender=members.find(m=>m.id===msg.sentBy);
            return <div key={msg.id} className="msg-row">
              <div style={{width:36,height:36,borderRadius:10,background:msg.channel==="Email"?"#e8f0fe":"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                {msg.channel==="Email"?"📧":"📱"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{msg.channel==="Email"?msg.subject:"SMS Message"}</span>
                  <span className="badge" style={{background:msg.channel==="Email"?"#e8f0fe":"#e8f5e9",color:msg.channel==="Email"?"#1B4F8A":"#2e7d32",borderColor:msg.channel==="Email"?"#a8c4f0":"#a5d6a7"}}>{msg.channel}</span>
                </div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{msg.body}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>To: <strong>{msg.to}</strong> · {fmt(msg.date)} · Sent by {sender?`${sender.firstName} ${sender.lastName}`:"Unknown"}</div>
              </div>
            </div>;
          })}
      </div>
    </div>}
  </div>;
}

// ─── CALENDAR MODULE ──────────────────────────────────────────────────────────
function CalendarModule({events,groups,onSaveEvent,onDeleteEvent}){
  const today=new Date();
  const [calYear,setCalYear]=useState(today.getFullYear());
  const [calMonth,setCalMonth]=useState(today.getMonth());
  const [subView,setSubView]=useState("calendar"); // calendar | list
  const [showForm,setShowForm]=useState(false);
  const [editEvent,setEditEvent]=useState(null);
  const [selectedDay,setSelectedDay]=useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null);

  const blankEvent=()=>({title:"",date:selectedDay||todayStr(),time:"10:00",endTime:"11:00",location:"",groupId:"",type:"Church-Wide",description:"",color:"#1B4F8A"});
  const [eForm,setEForm]=useState(blankEvent());
  const [eErr,setEErr]=useState({});

  const monthEvents=useMemo(()=>events.filter(e=>{
    const d=new Date(e.date+"T12:00");
    return d.getFullYear()===calYear&&d.getMonth()===calMonth;
  }),[events,calYear,calMonth]);

  // Build calendar grid
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const daysInPrev=new Date(calYear,calMonth,0).getDate();
  const cells=[];
  for(let i=firstDay-1;i>=0;i--)cells.push({day:daysInPrev-i,month:"prev"});
  for(let d=1;d<=daysInMonth;d++)cells.push({day:d,month:"curr"});
  const remaining=42-cells.length;
  for(let d=1;d<=remaining;d++)cells.push({day:d,month:"next"});

  const getDateStr=(day)=>`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const todayStr2=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const openAdd=(dateStr)=>{setEditEvent(null);setEForm({...blankEvent(),date:dateStr||todayStr()});setEErr({});setShowForm(true);};
  const openEdit=(e)=>{setEditEvent(e);setEForm({...e,groupId:e.groupId||""});setEErr({});setShowForm(true);};

  const handleSaveEvent=()=>{
    const e={};
    if(!eForm.title.trim())e.title="Required";
    if(!eForm.date)e.date="Required";
    if(Object.keys(e).length){setEErr(e);return;}
    onSaveEvent({...eForm,groupId:eForm.groupId?+eForm.groupId:null},editEvent?.id);
    setShowForm(false);setEditEvent(null);
  };

  const upcomingList=[...events].filter(e=>e.date>=todayStr()).sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.time||"").localeCompare(b.time||""));

  const EVENT_COLORS=["#1B4F8A","#2E75B6","#2e7d32","#7B1FA2","#E65100","#880E4F","#f57f17","#c62828","#00897B"];

  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>📅 Events & Calendar</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{events.length} events</div></div>
      <button className="btn-primary" onClick={()=>openAdd(todayStr())}>+ Add Event</button>
    </div>

    <div style={{display:"flex",gap:6,marginBottom:18}}>
      {[["calendar","📅 Calendar"],["list","📋 Upcoming"]].map(([key,label])=>(
        <button key={key} className="tab-btn" onClick={()=>setSubView(key)}
          style={{background:subView===key?"#1B4F8A":"#fff",color:subView===key?"#fff":"#64748b",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",flex:"none",padding:"9px 20px"}}>
          {label}
        </button>
      ))}
    </div>

    {/* Event Form Modal */}
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(10,20,40,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
      <div className="card fade-in" style={{padding:28,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0d2d5e",marginBottom:20}}>{editEvent?"✏️ Edit Event":"➕ Add Event"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:11,color:eErr.title?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Event Title *</label>
            <input className="field-input" value={eForm.title} onChange={e=>setEForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Sunday Morning Worship" style={{borderColor:eErr.title?"#c62828":undefined}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Date *</label>
            <input type="date" className="field-input" value={eForm.date} onChange={e=>setEForm(f=>({...f,date:e.target.value}))}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Type</label>
            <select className="field-input" value={eForm.type} onChange={e=>setEForm(f=>({...f,type:e.target.value}))}>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Start Time</label>
            <input type="time" className="field-input" value={eForm.time} onChange={e=>setEForm(f=>({...f,time:e.target.value}))}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>End Time</label>
            <input type="time" className="field-input" value={eForm.endTime} onChange={e=>setEForm(f=>({...f,endTime:e.target.value}))}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Location</label>
            <input className="field-input" value={eForm.location} onChange={e=>setEForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Sanctuary, Fellowship Hall"/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Group (optional)</label>
            <select className="field-input" value={eForm.groupId} onChange={e=>setEForm(f=>({...f,groupId:e.target.value}))}>
              <option value="">Church-Wide</option>
              {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Color</label>
            <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
              {EVENT_COLORS.map(c=><button key={c} onClick={()=>setEForm(f=>({...f,color:c}))} style={{width:24,height:24,borderRadius:"50%",background:c,border:eForm.color===c?"3px solid #1e293b":"2px solid transparent",cursor:"pointer"}}/>)}
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Description</label>
            <textarea className="field-input" value={eForm.description} onChange={e=>setEForm(f=>({...f,description:e.target.value}))} rows={3} style={{resize:"vertical"}} placeholder="Optional details about this event"/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          {editEvent&&<button className="btn-danger" onClick={()=>{setDeleteTarget(editEvent);setShowForm(false);}}>🗑 Delete</button>}
          <button className="btn-primary" onClick={handleSaveEvent}>{editEvent?"💾 Save":"➕ Add Event"}</button>
        </div>
      </div>
    </div>}

    {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"? This cannot be undone.`} onConfirm={()=>{onDeleteEvent(deleteTarget.id);setDeleteTarget(null);}} onCancel={()=>setDeleteTarget(null)}/>}

    {/* CALENDAR VIEW */}
    {subView==="calendar"&&<div className="slide-in">
      <div className="card" style={{padding:22}}>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <button className="btn-ghost" onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}} style={{padding:"6px 14px"}}>‹</button>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#0d2d5e"}}>
            {new Date(calYear,calMonth).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
          </div>
          <button className="btn-ghost" onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}} style={{padding:"6px 14px"}}>›</button>
        </div>
        {/* Day headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#94a3b8",padding:"4px 0",textTransform:"uppercase",letterSpacing:0.5}}>{d}</div>)}
        </div>
        {/* Calendar cells */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {cells.map((cell,i)=>{
            const dateStr=cell.month==="curr"?getDateStr(cell.day):null;
            const dayEvents=dateStr?events.filter(e=>e.date===dateStr):[];
            const isToday=dateStr===todayStr2;
            return <div key={i} className={`cal-day${isToday?" today":""}${cell.month!=="curr"?" other-month":""}`}
              onClick={()=>cell.month==="curr"&&openAdd(dateStr)}>
              <div style={{fontSize:12,fontWeight:isToday?800:500,color:isToday?"#2E75B6":"#334155",marginBottom:2}}>{cell.day}</div>
              {dayEvents.slice(0,2).map(e=>(
                <div key={e.id} className="cal-event" style={{background:`${e.color}22`,color:e.color}}
                  onClick={ev=>{ev.stopPropagation();openEdit(e);}}>
                  {e.title}
                </div>
              ))}
              {dayEvents.length>2&&<div style={{fontSize:9,color:"#94a3b8",fontWeight:600,marginTop:2}}>+{dayEvents.length-2} more</div>}
            </div>;
          })}
        </div>
      </div>
    </div>}

    {/* UPCOMING LIST VIEW */}
    {subView==="list"&&<div className="slide-in">
      <div className="card" style={{overflow:"hidden"}}>
        {upcomingList.length===0?<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>📅</div>No upcoming events.</div>:
          upcomingList.map(e=>{
            const grp=groups.find(g=>g.id===e.groupId);
            return <div key={e.id} style={{display:"flex",gap:14,padding:"16px 20px",borderBottom:"1px solid #f0f4f9",alignItems:"flex-start",cursor:"pointer",transition:"background 0.12s"}}
              onClick={()=>openEdit(e)}>
              <div style={{background:e.color,borderRadius:10,padding:"6px 10px",textAlign:"center",minWidth:46,flexShrink:0}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontWeight:600}}>{new Date(e.date+"T12:00").toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</div>
                <div style={{fontSize:18,color:"#fff",fontWeight:800,lineHeight:1}}>{new Date(e.date+"T12:00").getDate()}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:2}}>{e.title}</div>
                <div style={{fontSize:13,color:"#64748b"}}>{fmtTime(e.time)}{e.endTime?` – ${fmtTime(e.endTime)}`:""} · 📍 {e.location||"TBD"}</div>
                {grp&&<div style={{marginTop:4}}><span style={{fontSize:11,fontWeight:600,color:grp.color,background:`${grp.color}18`,padding:"2px 8px",borderRadius:10}}>{grp.name}</span></div>}
                {e.description&&<div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>{e.description}</div>}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:e.color,background:`${e.color}15`,padding:"4px 10px",borderRadius:8,flexShrink:0}}>{e.type}</span>
            </div>;
          })}
      </div>
    </div>}
  </div>;
}

// ─── GIVING MODULE (Phase 2) ──────────────────────────────────────────────────
function GivingModule({members,giving,onAddGift,onDeleteGift}){
  const [subView,setSubView]=useState("overview");
  const [filterMember,setFilterMember]=useState("all");
  const [filterMonth,setFilterMonth]=useState("");
  const [filterCat,setFilterCat]=useState("all");
  const [showForm,setShowForm]=useState(false);
  const [deleteTarget,setDeleteTarget]=useState(null);
  const [gForm,setGForm]=useState({memberId:"",date:todayStr(),amount:"",method:"Cash",category:"Tithe",note:""});
  const [gErr,setGErr]=useState({});
  const memberMap=useMemo(()=>Object.fromEntries(members.map(m=>[m.id,m])),[members]);
  const filtered=useMemo(()=>giving.filter(g=>(filterMember==="all"||g.memberId===Number(filterMember))&&(!filterMonth||g.date.startsWith(filterMonth))&&(filterCat==="all"||g.category===filterCat)).sort((a,b)=>(b.date||"").localeCompare(a.date||"")),[giving,filterMember,filterMonth,filterCat]);
  const filteredTotal=filtered.reduce((s,g)=>s+g.amount,0);
  const td=new Date();
  const thisMonth=`${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,"0")}`;
  const weekStart=isoWeek(todayStr());
  const weekly=giving.filter(g=>isoWeek(g.date)===weekStart).reduce((s,g)=>s+g.amount,0);
  const monthly=giving.filter(g=>g.date.startsWith(thisMonth)).reduce((s,g)=>s+g.amount,0);
  const yearly=giving.filter(g=>g.date.startsWith(`${td.getFullYear()}`)).reduce((s,g)=>s+g.amount,0);
  const memberTotals=useMemo(()=>{const yr=td.getFullYear();const map={};giving.filter(g=>g.date.startsWith(`${yr}`)).forEach(g=>{if(!map[g.memberId])map[g.memberId]={total:0,gifts:[]};map[g.memberId].total+=g.amount;map[g.memberId].gifts.push(g);});return map;},[giving]);
  const handleAddGift=()=>{const e={};if(!gForm.memberId)e.memberId="Required";if(!gForm.amount||isNaN(gForm.amount)||+gForm.amount<=0)e.amount="Enter valid amount";if(!gForm.date)e.date="Required";if(Object.keys(e).length){setGErr(e);return;}onAddGift({...gForm,memberId:Number(gForm.memberId),amount:parseFloat(gForm.amount)});setGForm({memberId:"",date:todayStr(),amount:"",method:"Cash",category:"Tithe",note:""});setGErr({});setShowForm(false);};
  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>💰 Giving & Contributions</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{giving.length} total records</div></div>
      <button className="btn-primary" onClick={()=>setShowForm(true)}>+ Log a Gift</button>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:18}}>
      {[["overview","📊 Overview"],["log","📋 Gift Log"],["statements","📄 Statements"]].map(([key,label])=>(
        <button key={key} className="tab-btn" onClick={()=>setSubView(key)} style={{background:subView===key?"#1B4F8A":"#fff",color:subView===key?"#fff":"#64748b",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",flex:"none",padding:"9px 20px"}}>{label}</button>
      ))}
    </div>
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(10,20,40,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div className="card fade-in" style={{padding:30,width:"90%",maxWidth:480}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0d2d5e",marginBottom:20}}>Log a Gift</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{display:"block",fontSize:11,color:gErr.memberId?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Member / Donor</label>
            <select className="field-input" value={gForm.memberId} onChange={e=>setGForm(f=>({...f,memberId:e.target.value}))} style={{borderColor:gErr.memberId?"#c62828":undefined}}>
              <option value="">Select member…</option>
              {[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=><option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>)}
            </select>
          </div>
          <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Date</label><input type="date" className="field-input" value={gForm.date} onChange={e=>setGForm(f=>({...f,date:e.target.value}))}/></div>
          <div><label style={{display:"block",fontSize:11,color:gErr.amount?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Amount ($)</label><input type="number" className="field-input" value={gForm.amount} onChange={e=>setGForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={{borderColor:gErr.amount?"#c62828":undefined}}/></div>
          <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Method</label><select className="field-input" value={gForm.method} onChange={e=>setGForm(f=>({...f,method:e.target.value}))}>{METHODS.map(o=><option key={o}>{o}</option>)}</select></div>
          <div><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Category</label><select className="field-input" value={gForm.category} onChange={e=>setGForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(o=><option key={o}>{o}</option>)}</select></div>
          <div style={{gridColumn:"1/-1"}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>Note (optional)</label><input className="field-input" value={gForm.note} onChange={e=>setGForm(f=>({...f,note:e.target.value}))} placeholder="e.g. Guest speaker offering"/></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="btn-ghost" onClick={()=>{setShowForm(false);setGErr({});}}>Cancel</button><button className="btn-primary" onClick={handleAddGift}>💾 Save Gift</button></div>
      </div>
    </div>}
    {deleteTarget&&<ConfirmModal message={`Remove the ${dollar(deleteTarget.amount)} gift from ${memberMap[deleteTarget.memberId]?.firstName} ${memberMap[deleteTarget.memberId]?.lastName}?`} onConfirm={()=>{onDeleteGift(deleteTarget.id);setDeleteTarget(null);}} onCancel={()=>setDeleteTarget(null)}/>}
    {subView==="overview"&&<div className="slide-in">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
        {[["This Week",dollar(weekly),"#1B4F8A"],["This Month",dollar(monthly),"#2e7d32"],["This Year",dollar(yearly),"#00897B"]].map(([label,val,color])=>(
          <div key={label} className="stat-card" style={{borderTop:`4px solid ${color}`,textAlign:"center"}}><div style={{fontSize:13,color:"#64748b",fontWeight:600,marginBottom:6}}>{label}</div><div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Playfair Display',serif"}}>{val}</div></div>
        ))}
      </div>
      <div className="card" style={{padding:24,marginBottom:16}}>
        <SectionHeader emoji="📊" title="This Month by Category"/>
        {CATEGORIES.map(cat=>{const total=giving.filter(g=>g.date.startsWith(thisMonth)&&g.category===cat).reduce((s,g)=>s+g.amount,0);if(!total)return null;const pct=monthly?(total/monthly*100).toFixed(0):0;return <div key={cat} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{cat}</span><span style={{fontSize:13,fontWeight:700,color:"#1B4F8A"}}>{dollar(total)}</span></div><div style={{background:"#e8f0fe",borderRadius:8,height:8,overflow:"hidden"}}><div style={{width:`${pct}%`,background:"#1B4F8A",height:"100%",borderRadius:8}}/></div></div>;})}
      </div>
    </div>}
    {subView==="log"&&<div className="slide-in">
      <div className="card" style={{padding:"14px 16px",marginBottom:14,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <select className="field-input" value={filterMember} onChange={e=>setFilterMember(e.target.value)} style={{flex:"1 1 180px"}}><option value="all">All Members</option>{[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=><option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>)}</select>
        <input type="month" className="field-input" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{flex:"0 0 160px"}}/>
        <select className="field-input" value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{flex:"0 0 150px"}}><option value="all">All Categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <div style={{fontSize:14,fontWeight:700,color:"#1B4F8A",flexShrink:0}}>Total: {dollar(filteredTotal)}</div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        {filtered.length===0?<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>💸</div>No gifts match filters.</div>:
          filtered.map(g=>{const m=memberMap[g.memberId];return <div key={g.id} className="giving-row"><div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>{m?<Avatar member={m} size={36}/>:<div style={{width:36,height:36,borderRadius:"50%",background:"#e2e8f0"}}/>}<div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{m?`${m.firstName} ${m.lastName}`:"Unknown"}</div><div style={{fontSize:12,color:"#64748b"}}>{fmt(g.date)} · {g.category}{g.note?` · ${g.note}`:""}</div></div></div><span style={{fontSize:11,fontWeight:600,color:METHOD_COLORS[g.method]||"#546E7A",background:"#f1f5f9",padding:"3px 10px",borderRadius:12,marginRight:8}}>{g.method}</span><div style={{fontSize:16,fontWeight:800,color:"#2e7d32",minWidth:70,textAlign:"right"}}>{dollar(g.amount)}</div><button onClick={()=>setDeleteTarget(g)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef9a9a",fontSize:16,padding:"0 4px",marginLeft:8}}>🗑</button></div>;})}
      </div>
    </div>}
    {subView==="statements"&&<div className="slide-in">
      <div className="card" style={{padding:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <SectionHeader emoji="📄" title={`${td.getFullYear()} Year-End Giving Statements`}/>
          <button className="btn-primary" style={{fontSize:13}} onClick={()=>{
            const yr=td.getFullYear();
            const EIN="82-2734521"; // ← REPLACE with Living Water's actual EIN
            const rows=members.filter(m=>memberTotals[m.id]).sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=>{
              const d=memberTotals[m.id];
              const giftRows=d.gifts.sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(g=>`
                <tr>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee">${fmt(g.date)}</td>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee">${g.category}</td>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee">${g.method}</td>
                  <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">$${g.amount.toFixed(2)}</td>
                </tr>`).join("");
              return `
                <div style="page-break-inside:avoid;margin-bottom:48px;padding-bottom:32px;border-bottom:2px solid #0d2d5e;">
                  <h2 style="font-size:16px;text-align:center;color:#0d2d5e;margin:0 0 12px;">
                    CHARITABLE CONTRIBUTION STATEMENT — ${yr}
                  </h2>
                  <table style="width:100%;font-size:12px;margin-bottom:12px;">
                    <tr>
                      <td><strong>Donor:</strong> ${m.firstName} ${m.lastName}${m.address?"<br/>"+m.address:""}</td>
                      <td style="text-align:right"><strong>Date:</strong> ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</td>
                    </tr>
                  </table>
                  <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <thead><tr style="background:#0d2d5e;color:#fff;">
                      <th style="padding:7px 8px;text-align:left">Date</th>
                      <th style="padding:7px 8px;text-align:left">Fund</th>
                      <th style="padding:7px 8px;text-align:left">Method</th>
                      <th style="padding:7px 8px;text-align:right">Amount</th>
                    </tr></thead>
                    <tbody>${giftRows}</tbody>
                    <tfoot><tr style="background:#f0f4f9;">
                      <td colspan="3" style="padding:8px;font-weight:bold;border-top:2px solid #0d2d5e;">Total ${yr}</td>
                      <td style="padding:8px;font-weight:bold;text-align:right;color:#2e7d32;border-top:2px solid #0d2d5e;">$${d.total.toFixed(2)}</td>
                    </tr></tfoot>
                  </table>
                  <div style="margin-top:14px;padding:10px 12px;border:1px solid #ccc;font-size:10.5px;color:#444;line-height:1.6;background:#fafafa;">
                    Living Water Church In Christ is a 501(c)(3) tax-exempt organization (EIN: ${EIN}).
                    <strong>No goods or services were provided in exchange for these contributions.</strong>
                    Please retain for your tax records. This statement satisfies the IRC § 170(f)(8) written acknowledgment requirement.
                  </div>
                </div>`;
            }).join("");
            const el=document.getElementById("print-statement");
            el.innerHTML=`
              <div style="font-family:Georgia,serif;padding:40px;max-width:680px;margin:0 auto;color:#1a1a1a;">
                <div style="text-align:center;border-bottom:3px solid #0d2d5e;padding-bottom:16px;margin-bottom:32px;">
                  <h1 style="font-size:22px;color:#0d2d5e;margin:0 0 4px">Living Water Church In Christ</h1>
                  <p style="margin:0;font-size:12px;color:#555">McKees Rocks, PA 15136 &nbsp;|&nbsp; EIN: ${EIN} &nbsp;|&nbsp; 501(c)(3) Organization</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#0d2d5e;font-weight:bold;">ALL MEMBER GIVING STATEMENTS — TAX YEAR ${yr}</p>
                </div>
                ${rows}
                <p style="margin-top:24px;font-size:11px;color:#888;text-align:center;">Printed ${new Date().toLocaleDateString()} &nbsp;·&nbsp; Living Water Church In Christ &nbsp;·&nbsp; Confidential</p>
              </div>`;
            el.style.display="block";
            el.style.position="fixed";
            el.style.top="0";
            el.style.left="0";
            el.style.width="100%";
            el.style.background="white";
            el.style.zIndex="9999";
            setTimeout(()=>{
              window.print();
              setTimeout(()=>{
                el.style.display="none";
                el.style.position="";
                el.innerHTML="";
              },500);
            },100);
          }}>🖨 Print All Statements</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:0,overflow:"hidden",borderRadius:10,border:"1px solid #e2e8f0"}}>
          <div style={{display:"flex",padding:"10px 16px",background:"#f8fafc",fontWeight:700,fontSize:12,color:"#475569",textTransform:"uppercase",letterSpacing:0.6,borderBottom:"1px solid #e2e8f0"}}>
            <div style={{flex:1}}>Member</div><div style={{width:80,textAlign:"center"}}>Gifts</div><div style={{width:120,textAlign:"right"}}>Total Given</div><div style={{width:110,textAlign:"right"}}>Statement</div>
          </div>
          {[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=>{
            const data=memberTotals[m.id];
            const [open,setOpen]=[false,()=>{}];
            return <StatementRow key={m.id} member={m} data={data} year={td.getFullYear()}/>;
          })}
        </div>
      </div>
    </div>}
  </div>;
}

function StatementRow({member,data,year}){
  const [open,setOpen]=useState(false);
  const [sent,setSent]=useState(false);

  const handlePrint=()=>{
    if(!data)return;
    const EIN="82-2734521"; // ← REPLACE with Living Water's actual EIN
    const lines=data.gifts.sort((a,b)=>(a.date||"").localeCompare(b.date||""))
      .map(g=>`<tr>
        <td style="padding:7px 10px;border-bottom:1px solid #eee">${fmt(g.date)}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee">${g.category}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee">${g.method}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right">$${g.amount.toFixed(2)}</td>
      </tr>`).join("");
    const el=document.getElementById("print-statement");
    el.innerHTML=`
      <div style="font-family:Georgia,serif;padding:48px;max-width:640px;margin:0 auto;color:#1a1a1a;">

        <!-- Header -->
        <div style="border-bottom:3px solid #0d2d5e;padding-bottom:16px;margin-bottom:20px;">
          <h1 style="font-size:20px;color:#0d2d5e;margin:0 0 4px">Living Water Church In Christ</h1>
          <p style="margin:0;font-size:12px;color:#555">McKees Rocks, PA 15136</p>
          <p style="margin:2px 0 0;font-size:12px;color:#555">EIN: ${EIN} &nbsp;|&nbsp; 501(c)(3) Tax-Exempt Organization</p>
        </div>

        <!-- Title -->
        <h2 style="font-size:16px;text-align:center;color:#0d2d5e;margin:0 0 20px;letter-spacing:0.5px;">
          CHARITABLE CONTRIBUTION STATEMENT<br/>
          <span style="font-size:13px;font-weight:normal;color:#555">Tax Year ${year}</span>
        </h2>

        <!-- Donor Info -->
        <table style="width:100%;margin-bottom:20px;font-size:13px;">
          <tr>
            <td style="width:50%;vertical-align:top;">
              <strong>Prepared for:</strong><br/>
              ${member.firstName} ${member.lastName}<br/>
              ${member.address?member.address+"<br/>":""}
              ${member.city?member.city+", "+member.state+" "+member.zip:""}
            </td>
            <td style="width:50%;vertical-align:top;text-align:right;">
              <strong>Statement Date:</strong> ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}<br/>
              <strong>Tax Year:</strong> January 1 – December 31, ${year}
            </td>
          </tr>
        </table>

        <!-- Gifts Table -->
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
          <thead>
            <tr style="background:#0d2d5e;color:#fff;">
              <th style="padding:9px 10px;text-align:left;font-weight:600;">Date</th>
              <th style="padding:9px 10px;text-align:left;font-weight:600;">Fund / Category</th>
              <th style="padding:9px 10px;text-align:left;font-weight:600;">Method</th>
              <th style="padding:9px 10px;text-align:right;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${lines}</tbody>
          <tfoot>
            <tr style="background:#f0f4f9;">
              <td colspan="3" style="padding:10px;font-weight:bold;font-size:14px;border-top:2px solid #0d2d5e;">
                Total Contributions — ${year}
              </td>
              <td style="padding:10px;font-weight:bold;font-size:14px;text-align:right;color:#2e7d32;border-top:2px solid #0d2d5e;">
                $${data.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- IRS-Required Disclosure -->
        <div style="margin-top:28px;padding:14px 16px;border:1px solid #ccc;border-radius:6px;background:#fafafa;font-size:11.5px;color:#444;line-height:1.7;">
          <strong>Important Tax Information (IRC § 170):</strong><br/>
          Living Water Church In Christ is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN: ${EIN}).
          Your contributions may be tax-deductible to the extent allowed by law.<br/><br/>
          <strong>No goods or services were provided to the donor in exchange for these contributions.</strong><br/><br/>
          Please retain this statement for your tax records. The IRS requires a written acknowledgment for any single
          contribution of $250 or more. This statement serves as that acknowledgment.
        </div>

        <!-- Signature Block -->
        <div style="margin-top:32px;font-size:12px;color:#555;">
          <p style="margin:0;">Sincerely,</p>
          <p style="margin:16px 0 0;font-weight:bold;color:#0d2d5e;">Pastor William Baldwin</p>
          <p style="margin:2px 0 0;">Living Water Church In Christ</p>
        </div>

      </div>`;
    el.style.display="block";
    el.style.position="fixed";
    el.style.top="0";
    el.style.left="0";
    el.style.width="100%";
    el.style.background="white";
    el.style.zIndex="9999";
    setTimeout(()=>{
      window.print();
      setTimeout(()=>{
        el.style.display="none";
        el.style.position="";
        el.innerHTML="";
      },500);
    },100);
    setSent(true);
    setTimeout(()=>setSent(false),3000);
  };

  if(!data)return <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f0f4f9",opacity:0.5}}><div style={{flex:1,display:"flex",alignItems:"center",gap:10}}><Avatar member={member} size={32}/><span style={{fontSize:14,color:"#1e293b"}}>{member.lastName}, {member.firstName}</span></div><div style={{width:80,textAlign:"center",fontSize:13,color:"#94a3b8"}}>—</div><div style={{width:120,textAlign:"right",fontSize:13,color:"#94a3b8"}}>No gifts</div><div style={{width:110,textAlign:"right"}}><span style={{fontSize:12,color:"#cbd5e1",fontWeight:500}}>No record</span></div></div>;
  return <><div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f0f4f9",cursor:"pointer",background:open?"#f6f9ff":"#fff"}}>
    <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}><Avatar member={member} size={32}/><span style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{member.lastName}, {member.firstName}</span></div>
    <div style={{width:80,textAlign:"center",fontSize:13,color:"#64748b"}}>{data.gifts.length}</div>
    <div style={{width:120,textAlign:"right",fontSize:15,fontWeight:800,color:"#2e7d32"}}>${data.total.toFixed(2)}</div>
    <div style={{width:110,textAlign:"right"}}>
      <button onClick={e=>{e.stopPropagation();handlePrint();}} style={{background:sent?"#e8f5e9":"#1B4F8A",color:sent?"#2e7d32":"#fff",border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
        {sent?"✅ Printed":"🖨 Print"}
      </button>
    </div>
    <span style={{color:"#b0bec5",fontSize:16,marginLeft:12}}>{open?"▾":"›"}</span>
  </div>
  {open&&<div style={{background:"#f8fafc",padding:"12px 20px 16px 58px",borderBottom:"1px solid #e2e8f0"}}>{[...data.gifts].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(g=><div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #e9eef4",fontSize:13}}><span style={{color:"#475569"}}>{fmt(g.date)}</span><span style={{color:"#64748b"}}>{g.category}</span><span style={{color:METHOD_COLORS[g.method]||"#546E7A",fontWeight:600}}>{g.method}</span><span style={{fontWeight:700,color:"#2e7d32"}}>${g.amount.toFixed(2)}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontWeight:800,fontSize:14,color:"#1B4F8A"}}><span>Total {year}</span><span>${data.total.toFixed(2)}</span></div></div>}
  </>;
}

// ─── ATTENDANCE MODULE (Phase 2) ──────────────────────────────────────────────
function AttendanceModule({members,attendance,onSaveService}){
  const [subView,setSubView]=useState("checkin");
  const [serviceDate,setServiceDate]=useState(todayStr());
  const [checkedIn,setCheckedIn]=useState(()=>{const ex=attendance.find(a=>a.date===todayStr());return new Set(ex?ex.present:[]);});
  const [saved,setSaved]=useState(false);
  const [histMember,setHistMember]=useState("all");
  const activeMembers=members.filter(m=>m.status==="Member"||m.status==="Visitor");
  const toggleMember=id=>{setCheckedIn(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});setSaved(false);};
  const handleDateChange=d=>{setServiceDate(d);const ex=attendance.find(a=>a.date===d);setCheckedIn(new Set(ex?ex.present:[]));setSaved(false);};
  const handleSave=()=>{onSaveService({date:serviceDate,present:[...checkedIn]});setSaved(true);};
  const history=useMemo(()=>[...attendance].sort((a,b)=>(b.date||"").localeCompare(a.date||"")),[attendance]);
  const memberHistory=useMemo(()=>{if(histMember==="all")return null;const mid=Number(histMember);return history.map(s=>({...s,wasPresent:s.present.includes(mid)}));},[histMember,history]);
  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>📋 Attendance</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{attendance.length} services recorded</div></div>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:18}}>
      {[["checkin","☑️ Check-In"],["history","📅 History"]].map(([key,label])=>(
        <button key={key} className="tab-btn" onClick={()=>setSubView(key)} style={{background:subView===key?"#1B4F8A":"#fff",color:subView===key?"#fff":"#64748b",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",flex:"none",padding:"9px 20px"}}>{label}</button>
      ))}
    </div>
    {subView==="checkin"&&<div className="slide-in">
      <div className="card" style={{padding:22,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200}}><label style={{display:"block",fontSize:11,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>Service Date</label><input type="date" className="field-input" value={serviceDate} onChange={e=>handleDateChange(e.target.value)} style={{maxWidth:220}}/></div>
          <div style={{textAlign:"center",background:"#f1f5f9",borderRadius:12,padding:"12px 24px"}}><div style={{fontSize:28,fontWeight:800,color:"#1B4F8A",fontFamily:"'Playfair Display',serif"}}>{checkedIn.size}</div><div style={{fontSize:12,color:"#64748b",fontWeight:600}}>Present</div></div>
          <div style={{textAlign:"center",background:"#fce4ec",borderRadius:12,padding:"12px 24px"}}><div style={{fontSize:28,fontWeight:800,color:"#c62828",fontFamily:"'Playfair Display',serif"}}>{activeMembers.length-checkedIn.size}</div><div style={{fontSize:12,color:"#c62828",fontWeight:600}}>Absent</div></div>
          <button className="btn-primary" onClick={handleSave} style={{alignSelf:"flex-end"}}>{saved?"✅ Saved!":"💾 Save Service"}</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button className="btn-ghost" onClick={()=>{setCheckedIn(new Set(activeMembers.map(m=>m.id)));setSaved(false);}} style={{fontSize:12,padding:"6px 14px"}}>✅ Mark All Present</button>
        <button className="btn-ghost" onClick={()=>{setCheckedIn(new Set());setSaved(false);}} style={{fontSize:12,padding:"6px 14px"}}>❌ Clear All</button>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        {[...activeMembers].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=>{const present=checkedIn.has(m.id);return <div key={m.id} className="check-row" onClick={()=>toggleMember(m.id)} style={{cursor:"pointer"}}>
          <div style={{width:28,height:28,borderRadius:8,border:`2px solid ${present?"#2e7d32":"#dde3ed"}`,background:present?"#2e7d32":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>{present&&<span style={{color:"#fff",fontSize:16,fontWeight:700}}>✓</span>}</div>
          <Avatar member={m} size={36}/>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#1e293b"}}>{m.firstName} {m.lastName}</div><RolePip role={m.role}/></div>
          <span style={{fontSize:13,fontWeight:600,color:present?"#2e7d32":"#94a3b8"}}>{present?"Present":"Absent"}</span>
        </div>;})}
      </div>
    </div>}
    {subView==="history"&&<div className="slide-in">
      <div className="card" style={{padding:"14px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
        <select className="field-input" value={histMember} onChange={e=>setHistMember(e.target.value)} style={{maxWidth:260}}>
          <option value="all">All Members — Service Overview</option>
          {[...activeMembers].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||"")).map(m=><option key={m.id} value={m.id}>{m.lastName}, {m.firstName}</option>)}
        </select>
      </div>
      {histMember==="all"?<div className="card" style={{overflow:"hidden"}}>
        <div style={{display:"flex",padding:"10px 18px",background:"#f8fafc",fontWeight:700,fontSize:12,color:"#475569",textTransform:"uppercase",letterSpacing:0.6,borderBottom:"1px solid #e2e8f0"}}><div style={{flex:1}}>Date</div><div style={{width:80,textAlign:"center"}}>Present</div><div style={{width:80,textAlign:"center"}}>Absent</div><div style={{width:100,textAlign:"right"}}>Rate</div></div>
        {history.map(s=>{const pct=activeMembers.length?(s.present.length/activeMembers.length*100).toFixed(0):0;return <div key={s.date} style={{display:"flex",alignItems:"center",padding:"13px 18px",borderBottom:"1px solid #f0f4f9"}}><div style={{flex:1,fontSize:14,fontWeight:600,color:"#1e293b"}}>{fmt(s.date)}</div><div style={{width:80,textAlign:"center",fontSize:14,color:"#2e7d32",fontWeight:600}}>{s.present.length}</div><div style={{width:80,textAlign:"center",fontSize:14,color:"#c62828",fontWeight:600}}>{activeMembers.length-s.present.length}</div><div style={{width:100,textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:+pct>=80?"#2e7d32":+pct>=60?"#f57f17":"#c62828"}}>{pct}%</span></div></div>;})}
      </div>:(()=>{const mid=Number(histMember);const m=members.find(x=>x.id===mid);const total=history.length;const attended=history.filter(s=>s.present.includes(mid)).length;const rate=total?(attended/total*100).toFixed(0):0;return <><div className="card" style={{padding:22,marginBottom:14,display:"flex",gap:20,alignItems:"center"}}>{m&&<Avatar member={m} size={52}/>}<div style={{flex:1}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#0d2d5e"}}>{m?.firstName} {m?.lastName}</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{attended} of {total} services attended</div>{getMissedSundays(mid,attendance)&&<div style={{marginTop:6,fontSize:12,color:"#c62828",fontWeight:600}}>⚠️ Missed 2+ consecutive Sundays</div>}</div><div style={{textAlign:"center",background:"#f1f5f9",borderRadius:12,padding:"12px 24px"}}><div style={{fontSize:28,fontWeight:800,color:+rate>=80?"#2e7d32":+rate>=60?"#f57f17":"#c62828",fontFamily:"'Playfair Display',serif"}}>{rate}%</div><div style={{fontSize:12,color:"#64748b",fontWeight:600}}>Attendance</div></div></div><div className="card" style={{overflow:"hidden"}}>{memberHistory.map(s=><div key={s.date} style={{display:"flex",alignItems:"center",padding:"12px 18px",borderBottom:"1px solid #f0f4f9",gap:14}}><div style={{width:20,height:20,borderRadius:6,background:s.wasPresent?"#e8f5e9":"#fce4ec",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{s.wasPresent?"✓":"✗"}</div><div style={{flex:1,fontSize:14,color:"#1e293b",fontWeight:500}}>{fmt(s.date)}</div><span style={{fontSize:13,fontWeight:600,color:s.wasPresent?"#2e7d32":"#c62828"}}>{s.wasPresent?"Present":"Absent"}</span></div>)}</div></>;})()}
    </div>}
  </div>;
}

// ─── MEMBERS MODULE (Phase 1) ─────────────────────────────────────────────────
function MemberList({members,onSelect,onAdd}){
  const [search,setSearch]=useState("");const[filterStatus,setFilterStatus]=useState("All");const[filterGroup,setFilterGroup]=useState("All");const[sortBy,setSortBy]=useState("lastName");
  const filtered=members.filter(m=>{const q=search.toLowerCase();return(!q||`${m.firstName} ${m.lastName} ${m.email} ${m.phone}`.toLowerCase().includes(q))&&(filterStatus==="All"||m.status===filterStatus)&&(filterGroup==="All"||m.groups.includes(filterGroup));}).sort((a,b)=>sortBy==="lastName"?(a.lastName||"").localeCompare(b.lastName||""):sortBy==="firstName"?(a.firstName||"").localeCompare(b.firstName||""):(b.joinDate||"").localeCompare(a.joinDate||""));
  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>People & Families</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>{members.length} total records</div></div><button className="btn-primary" onClick={onAdd}>+ Add Member</button></div>
    <div className="card" style={{padding:"14px 16px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <input className="field-input" placeholder="🔍  Search by name, email, phone…" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:"1 1 220px",minWidth:180}}/>
      <select className="field-input" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{flex:"0 0 140px"}}><option value="All">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      <select className="field-input" value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} style={{flex:"0 0 180px"}}><option value="All">All Groups</option>{GROUP_NAMES.map(g=><option key={g}>{g}</option>)}</select>
      <select className="field-input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{flex:"0 0 150px"}}><option value="lastName">Sort: Last Name</option><option value="firstName">Sort: First Name</option><option value="joinDate">Sort: Join Date</option></select>
    </div>
    <div className="card" style={{overflow:"hidden"}}>
      {filtered.length===0?<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:10}}>🔍</div><div style={{fontWeight:600}}>No members found</div></div>:
        filtered.map(m=><div key={m.id} className="member-row" onClick={()=>onSelect(m)}><Avatar member={m} size={44}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>{m.firstName} {m.lastName}</div><div style={{fontSize:12,color:"#64748b",marginTop:1}}>{m.email||m.phone||"No contact info"}</div></div><RolePip role={m.role}/><div style={{width:80,textAlign:"right"}}><StatusBadge status={m.status}/></div><div style={{fontSize:12,color:"#94a3b8",width:90,textAlign:"right"}}>{fmt(m.joinDate)}</div><div style={{color:"#b0bec5",fontSize:18,paddingLeft:8}}>›</div></div>)}
    </div>
  </div>;
}

function MemberDetail({member,onEdit,onDelete,onBack}){
  const [tab,setTab]=useState("info");
  const tabs=["info","spiritual","groups","notes"];
  const tabLabels={info:"📋 Info",spiritual:"✝️ Spiritual",groups:"⛪ Groups",notes:"📝 Notes"};
  return <div className="fade-in" style={{maxWidth:720,margin:"0 auto"}}>
    <button className="btn-ghost" onClick={onBack} style={{marginBottom:16,padding:"7px 14px",fontSize:13}}>← Back to Members</button>
    <div className="card" style={{padding:28,marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:20}}><Avatar member={member} size={72}/><div style={{flex:1}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>{member.firstName} {member.lastName}</div><div style={{display:"flex",gap:10,alignItems:"center",marginTop:6,flexWrap:"wrap"}}><RolePip role={member.role}/><StatusBadge status={member.status}/>{member.family&&<span style={{fontSize:12,color:"#64748b"}}>👨‍👩‍👧 {member.family} Family</span>}</div></div><div style={{display:"flex",gap:8}}><button className="btn-primary" onClick={onEdit}>✏️ Edit</button><button className="btn-danger" onClick={onDelete}>🗑</button></div></div></div>
    <div style={{display:"flex",gap:4,marginBottom:14,background:"#fff",borderRadius:12,padding:5,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>{tabs.map(t=><button key={t} className="tab-btn" onClick={()=>setTab(t)} style={{background:tab===t?"#1B4F8A":"transparent",color:tab===t?"#fff":"#64748b"}}>{tabLabels[t]}</button>)}</div>
    <div className="card" style={{padding:28}}>
      {tab==="info"&&<div className="slide-in" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>{[["Phone",member.phone],["Email",member.email],["Address",member.address],["Address 2",member.address2],["City",member.city],["State / ZIP",member.state&&member.zip?`${member.state} ${member.zip}`:""],["Birthday",fmt(member.birthday)],["Anniversary",fmt(member.anniversary)],["Join Date",fmt(member.joinDate)],["Found Us Via",member.visitorSource]].map(([l,v])=><FieldBlock key={l} label={l} value={v}/>)}</div>}
      {tab==="spiritual"&&<div className="slide-in" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>{[["Saved?",member.saved?"✅ Yes":"No"],["Saved Date",fmt(member.savedDate)],["Baptized?",member.baptized?"✅ Yes":"No"],["Baptism Date",fmt(member.baptismDate)],["Membership Class",member.membershipClass?"✅ Completed":"Not yet"],["Volunteer Roles",member.volunteerRoles.join(", ")||"None"]].map(([l,v])=><FieldBlock key={l} label={l} value={v}/>)}</div>}
      {tab==="groups"&&<div className="slide-in">{member.groups.length?<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{member.groups.map(g=><span key={g} style={{background:"#e8f0fe",color:"#1B4F8A",border:"1px solid #a8c4f0",borderRadius:20,padding:"7px 18px",fontSize:13,fontWeight:600}}>{g}</span>)}</div>:<div style={{color:"#94a3b8",fontSize:14}}>Not in any groups yet.</div>}</div>}
      {tab==="notes"&&<div className="slide-in"><div style={{fontSize:15,color:"#334155",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{member.notes||<span style={{color:"#94a3b8"}}>No notes yet.</span>}</div></div>}
    </div>
  </div>;
}

// ─── MemberForm Field sub-component (defined OUTSIDE MemberForm to prevent remounting) ───
function MemberField({label,fk,type,options,req,value,onChange,error}){
  const t=type||"text";
  return <div>
    {t!=="checkbox"&&<label style={{display:"block",fontSize:11,color:error?"#c62828":"#64748b",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.6}}>{label}{req&&<span style={{color:"#c62828"}}> *</span>}</label>}
    {t==="select"?<select className="field-input" value={value} onChange={e=>onChange(fk,e.target.value)}>{(options||[]).map(o=><option key={o}>{o}</option>)}</select>
    :t==="checkbox"?<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={value} onChange={e=>onChange(fk,e.target.checked)} style={{width:16,height:16,accentColor:"#1B4F8A"}}/><span style={{fontSize:14,color:"#334155",fontWeight:500}}>{label}</span></label>
    :<input type={t} className="field-input" value={value||""} onChange={e=>onChange(fk,e.target.value)} style={{borderColor:error?"#c62828":undefined}}/>}
    {error&&<div style={{fontSize:11,color:"#c62828",marginTop:3}}>{error}</div>}
  </div>;
}

function MemberForm({initial,onSave,onCancel,isEdit}){
  const [form,setForm]=useState(initial||blankMember());
  const [errors,setErrors]=useState({});
  const set=(key,val)=>setForm(f=>({...f,[key]:val}));
  const validate=()=>{const e={};if(!form.firstName.trim())e.firstName="Required";if(!form.lastName.trim())e.lastName="Required";return e;};
  const handleSave=()=>{const e=validate();if(Object.keys(e).length){setErrors(e);return;}onSave(form);};
  const toggleGroup=g=>set("groups",form.groups.includes(g)?form.groups.filter(x=>x!==g):[...form.groups,g]);
  return <div className="fade-in" style={{maxWidth:720,margin:"0 auto"}}>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:"#0d2d5e",marginBottom:20}}>{isEdit?"✏️ Edit Member":"➕ Add New Member"}</div>
    {/* Personal Info */}
    <div className="card" style={{padding:26,marginBottom:14}}>
      <SectionHeader emoji="👤" title="Personal Information"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <MemberField label="First Name" fk="firstName" req value={form.firstName} onChange={set} error={errors.firstName}/>
        <MemberField label="Last Name" fk="lastName" req value={form.lastName} onChange={set} error={errors.lastName}/>
        <MemberField label="Role" fk="role" type="select" options={ROLES} value={form.role} onChange={set}/>
        <MemberField label="Status" fk="status" type="select" options={STATUSES} value={form.status} onChange={set}/>
        <MemberField label="Phone" fk="phone" type="tel" value={form.phone} onChange={set}/>
        <MemberField label="Email" fk="email" type="email" value={form.email} onChange={set}/>
        <MemberField label="Address Line 1" fk="address" value={form.address} onChange={set}/>
        <MemberField label="Address Line 2" fk="address2" value={form.address2} onChange={set}/>
        <MemberField label="City" fk="city" value={form.city} onChange={set}/>
        <MemberField label="State" fk="state" value={form.state} onChange={set}/>
        <MemberField label="ZIP Code" fk="zip" value={form.zip} onChange={set}/>
        <MemberField label="Family / Household" fk="family" value={form.family} onChange={set}/>
        <MemberField label="Birthday" fk="birthday" type="date" value={form.birthday} onChange={set}/>
        <MemberField label="Anniversary" fk="anniversary" type="date" value={form.anniversary} onChange={set}/>
        <MemberField label="Join Date" fk="joinDate" type="date" value={form.joinDate} onChange={set}/>
        <MemberField label="How They Found Us" fk="visitorSource" type="select" options={SOURCES} value={form.visitorSource} onChange={set}/>
      </div>
    </div>
    {/* Spiritual Info */}
    <div className="card" style={{padding:26,marginBottom:14}}>
      <SectionHeader emoji="✝️" title="Spiritual Information"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <MemberField label="Saved?" fk="saved" type="checkbox" value={form.saved} onChange={set}/>
        <MemberField label="Saved Date" fk="savedDate" type="date" value={form.savedDate} onChange={set}/>
        <MemberField label="Baptized?" fk="baptized" type="checkbox" value={form.baptized} onChange={set}/>
        <MemberField label="Baptism Date" fk="baptismDate" type="date" value={form.baptismDate} onChange={set}/>
        <div style={{gridColumn:"1/-1"}}><MemberField label="Completed Membership Class?" fk="membershipClass" type="checkbox" value={form.membershipClass} onChange={set}/></div>
      </div>
    </div>
    {/* Groups */}
    <div className="card" style={{padding:26,marginBottom:14}}>
      <SectionHeader emoji="⛪" title="Group Memberships"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {GROUP_NAMES.map(g=><button key={g} onClick={()=>toggleGroup(g)} style={{padding:"7px 16px",borderRadius:20,fontSize:13,cursor:"pointer",fontWeight:500,background:form.groups.includes(g)?"#1B4F8A":"#f1f5f9",color:form.groups.includes(g)?"#fff":"#475569",border:form.groups.includes(g)?"1px solid #1B4F8A":"1px solid #cbd5e1"}}>{g}</button>)}
      </div>
    </div>
    {/* Notes */}
    <div className="card" style={{padding:26,marginBottom:20}}>
      <SectionHeader emoji="📝" title="Pastor's Notes"/>
      <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={4} placeholder="Private notes about this member…" className="field-input" style={{resize:"vertical"}}/>
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
      <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      <button className="btn-primary" onClick={handleSave}>{isEdit?"💾 Save Changes":"➕ Add Member"}</button>
    </div>
  </div>;
}

// ─── AUTO-REMINDERS MODULE ────────────────────────────────────────────────────
function RemindersModule({members,attendance,events}){
  const [enabled,setEnabled]=useState({birthday:true,anniversary:true,missed:true,eventReminder:true,givingStatement:false});
  const [saved,setSaved]=useState(false);
  const birthdays14=getUpcomingBirthdays(members,14);
  const missedMembers=members.filter(m=>getMissedSundays(m.id,attendance));
  const upcomingEvents=[...events].filter(e=>{
    const d=e.date||"";
    const diff=(new Date(d+"T12:00")-new Date())/86400000;
    return diff>=0&&diff<=7;
  });

  const toggle=id=>setEnabled(e=>({...e,[id]:!e[id]}));

  const ToggleRow=({id,icon,title,desc,count})=>(
    <div style={{display:"flex",alignItems:"flex-start",gap:16,padding:"18px 0",borderBottom:"1px solid #f0f4f9"}}>
      <div style={{width:44,height:44,borderRadius:12,background:enabled[id]?"#e8f0fe":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:2}}>{title}</div>
        <div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>{desc}</div>
        {count>0&&<div style={{marginTop:6,fontSize:12,fontWeight:600,color:enabled[id]?"#1B4F8A":"#94a3b8"}}>{enabled[id]?`✓ ${count} reminder${count!==1?"s":""} queued`:`${count} pending (paused)`}</div>}
      </div>
      <div onClick={()=>toggle(id)} style={{width:46,height:26,borderRadius:13,background:enabled[id]?"#1B4F8A":"#cbd5e1",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0,marginTop:4}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:enabled[id]?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
      </div>
    </div>
  );

  return <div className="fade-in">
    <div style={{marginBottom:24}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>🔔 Auto-Reminders</div>
      <div style={{fontSize:13,color:"#64748b",marginTop:4}}>Configure automated messages sent on your behalf</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,alignItems:"start"}}>
      <div className="card" style={{padding:28}}>
        <SectionHeader emoji="⚙️" title="Reminder Settings"/>
        <ToggleRow id="birthday" icon="🎂" title="Birthday Greetings" desc="Send a warm birthday message to each member on their birthday via SMS and email." count={birthdays14.length}/>
        <ToggleRow id="anniversary" icon="💍" title="Anniversary Greetings" desc="Send a celebratory message to couples on their wedding anniversary." count={0}/>
        <ToggleRow id="missed" icon="🙏" title="Missed Sunday Follow-Up" desc="Send a caring message to members who have missed 2 or more consecutive Sundays." count={missedMembers.length}/>
        <ToggleRow id="eventReminder" icon="📅" title="Event Reminders" desc="Send a reminder 24 hours before any upcoming church event or group meeting." count={upcomingEvents.length}/>
        <ToggleRow id="givingStatement" icon="📄" title="Year-End Giving Statements" desc="Email giving statements to all members each January for tax purposes." count={0}/>
        <div style={{marginTop:24,display:"flex",gap:10,alignItems:"center"}}>
          <button className="btn-primary" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}}>{saved?"✅ Saved!":"💾 Save Settings"}</button>
          <div style={{fontSize:12,color:"#94a3b8"}}>Activates when SendGrid & Twilio are connected in Phase 5</div>
        </div>
      </div>
      <div className="card" style={{padding:20}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#0d2d5e",marginBottom:14}}>📬 Message Previews</div>
        {birthdays14.length>0&&enabled.birthday&&<div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#f57f17",textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>🎂 {birthdays14[0].firstName}</div>
          <div style={{background:"#fff8e1",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#334155",lineHeight:1.6,border:"1px solid #ffe082"}}>
            Happy Birthday, {birthdays14[0].firstName}! 🎉 The entire Living Water family is celebrating you today. God bless you! — Pastor Baldwin
          </div>
        </div>}
        {missedMembers.length>0&&enabled.missed&&<div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#c62828",textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>🙏 {missedMembers[0].firstName}</div>
          <div style={{background:"#fce4ec",borderRadius:8,padding:"10px 12px",fontSize:12,color:"#334155",lineHeight:1.6,border:"1px solid #ef9a9a"}}>
            Hi {missedMembers[0].firstName}, we've been missing you at Living Water! You are loved and we are praying for you. — Pastor Baldwin
          </div>
        </div>}
        {birthdays14.length===0&&missedMembers.length===0&&<div style={{color:"#94a3b8",fontSize:13}}>No reminders queued right now.</div>}
      </div>
    </div>
  </div>;
}

// ─── REPORTS MODULE ───────────────────────────────────────────────────────────
// Each report is its own component so a crash in one tab never blanks the others

function RptBar({value,max,color,label,right}){
  const pct=(max>0)?Math.min(100,Math.round(value/max*100)):0;
  return <div style={{marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{label}</span>
      <span style={{fontSize:13,fontWeight:700,color}}>{right}</span>
    </div>
    <div style={{background:"#e8eef6",borderRadius:8,height:10,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,background:color,height:"100%",borderRadius:8}}/>
    </div>
  </div>;
}

function RptOverview({members,giving,attendance,groups}){
  const yr=new Date().getFullYear();
  const active=members.filter(m=>m.status==="Member");
  const visitors=members.filter(m=>m.status==="Visitor");
  const yrTotal=giving.filter(g=>(g.date||"").slice(0,4)===String(yr)).reduce((s,g)=>s+(g.amount||0),0);
  const avgAtt=attendance.length?Math.round(attendance.reduce((s,a)=>s+(a.present||[]).length,0)/attendance.length):0;
  const monthly=Array.from({length:12},(_,i)=>{
    const key=`${yr}-${String(i+1).padStart(2,"0")}`;
    const total=giving.filter(g=>(g.date||"").startsWith(key)).reduce((s,g)=>s+(g.amount||0),0);
    return{label:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],total};
  });
  const mMax=monthly.reduce((mx,m)=>m.total>mx?m.total:mx,1);
  const now=new Date();
  return <div className="slide-in">
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      {[["👥","Active Members",active.length,"#1B4F8A"],["🤝","Visitors",visitors.length,"#f57f17"],["💰",`${yr} Giving`,dollar(yrTotal),"#2e7d32"],["📋","Avg Attendance",avgAtt,"#00897B"]].map(([ic,lb,v,c])=>(
        <div key={lb} className="stat-card" style={{borderTop:`4px solid ${c}`,textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
          <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:"'Playfair Display',serif"}}>{v}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:2}}>{lb}</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="✝️" title="Spiritual Milestones"/>
        {[["Saved",members.filter(m=>m.saved).length,"#2e7d32"],["Baptized",members.filter(m=>m.baptized).length,"#1B4F8A"],["Membership Class",members.filter(m=>m.membershipClass).length,"#7B1FA2"]].map(([lb,v,c])=>(
          <RptBar key={lb} value={v} max={members.length||1} color={c} label={lb} right={`${v} / ${members.length}`}/>
        ))}
      </div>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="⛪" title="Group Summary"/>
        {groups.map(g=>(
          <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:g.color,flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,fontWeight:600,color:"#334155"}}>{g.name}</div>
            <span style={{fontSize:12,color:g.color,fontWeight:700}}>{(g.members||[]).length} members</span>
          </div>
        ))}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <SectionHeader emoji="💰" title={`Monthly Giving — ${yr}`}/>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,height:110,marginBottom:8}}>
        {monthly.map((m,i)=>{
          const h=mMax>0?Math.max(Math.round(m.total/mMax*90),m.total>0?3:0):0;
          const isCur=i===now.getMonth()&&yr===now.getFullYear();
          return <div key={m.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {m.total>0&&<div style={{fontSize:9,fontWeight:700,color:"#1B4F8A"}}>{dollar(m.total).replace(".00","")}</div>}
            <div style={{width:"100%",flex:1,display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",height:h,background:isCur?"#1B4F8A":"#bdd4f0",borderRadius:"4px 4px 0 0",minHeight:m.total>0?3:0}}/>
            </div>
            <div style={{fontSize:9,color:"#94a3b8",fontWeight:600}}>{m.label}</div>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

function RptGiving({members,giving}){
  const yr=new Date().getFullYear();
  const yg=giving.filter(g=>(g.date||"").slice(0,4)===String(yr));
  const tot=yg.reduce((s,g)=>s+(g.amount||0),0);
  const CATS=["Tithe","Offering","Love Offering","Missions","Building Fund","Other"];
  const METHS=["Cash","Check","Cash App","Zelle","Stripe"];
  const METHOD_C={Cash:"#2e7d32",Check:"#1B4F8A","Cash App":"#00897B",Zelle:"#6a1b9a",Stripe:"#7c4dff"};
  const active=members.filter(m=>m.status==="Member");
  const byMember=active.map(m=>{
    const gifts=yg.filter(g=>g.memberId===m.id);
    return{member:m,total:gifts.reduce((s,g)=>s+(g.amount||0),0),count:gifts.length};
  }).sort((a,b)=>b.total-a.total);
  const mMax=byMember.length?byMember[0].total||1:1;
  return <div className="slide-in">
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      {[["Total Gifts",yg.length,"#1B4F8A"],["Total Amount",dollar(tot),"#2e7d32"],["Avg per Gift",yg.length?dollar(tot/yg.length):"—","#00897B"]].map(([lb,v,c])=>(
        <div key={lb} className="stat-card" style={{borderTop:`4px solid ${c}`,textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:c,fontFamily:"'Playfair Display',serif"}}>{v}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:4}}>{lb}</div>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="🏷️" title="By Category"/>
        {CATS.map(cat=>{const t=yg.filter(g=>g.category===cat).reduce((s,g)=>s+(g.amount||0),0);return t?<RptBar key={cat} value={t} max={tot||1} color="#1B4F8A" label={cat} right={dollar(t)}/>:null;}).filter(Boolean)}
        {!yg.length&&<div style={{color:"#94a3b8",fontSize:13}}>No giving recorded for {yr}.</div>}
      </div>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="💳" title="By Method"/>
        {METHS.map(m=>{const t=yg.filter(g=>g.method===m).reduce((s,g)=>s+(g.amount||0),0);return t?<RptBar key={m} value={t} max={tot||1} color={METHOD_C[m]||"#546E7A"} label={m} right={dollar(t)}/>:null;}).filter(Boolean)}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <SectionHeader emoji="👤" title="Giving by Member"/>
      {byMember.map(({member:m,total:mt,count},i)=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",width:20,flexShrink:0}}>{i+1}</div>
          <Avatar member={m} size={32}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{m.firstName} {m.lastName}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{count} gift{count!==1?"s":""}</div>
          </div>
          <div style={{width:120}}>
            <div style={{background:"#e8eef6",borderRadius:6,height:10,overflow:"hidden"}}>
              <div style={{width:`${mMax>0?Math.round(mt/mMax*100):0}%`,background:"#1B4F8A",height:"100%",borderRadius:6}}/>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:"#2e7d32",minWidth:80,textAlign:"right"}}>{dollar(mt)}</div>
        </div>
      ))}
    </div>
  </div>;
}

function RptAttendance({members,attendance}){
  const active=members.filter(m=>m.status==="Member");
  const sorted=[...attendance].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const avg=sorted.length?Math.round(sorted.reduce((s,a)=>s+(a.present||[]).length,0)/sorted.length):0;
  const byMember=active.map(m=>{
    const att=attendance.filter(s=>(s.present||[]).includes(m.id)).length;
    const rate=attendance.length?Math.round(att/attendance.length*100):0;
    return{member:m,att,rate};
  }).sort((a,b)=>b.rate-a.rate);
  return <div className="slide-in">
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      {[["Services",attendance.length,"#1B4F8A"],["Avg Attendance",avg,"#2e7d32"],["Active Members",active.length,"#00897B"]].map(([lb,v,c])=>(
        <div key={lb} className="stat-card" style={{borderTop:`4px solid ${c}`,textAlign:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:c,fontFamily:"'Playfair Display',serif"}}>{v}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:4}}>{lb}</div>
        </div>
      ))}
    </div>
    <div className="card" style={{padding:22,marginBottom:16}}>
      <SectionHeader emoji="📊" title="By Service"/>
      <div style={{overflow:"hidden",borderRadius:8,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",padding:"8px 16px",background:"#f8fafc",fontWeight:700,fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,borderBottom:"1px solid #e2e8f0"}}>
          <div style={{flex:1}}>Date</div><div style={{width:80,textAlign:"center"}}>Present</div><div style={{width:80,textAlign:"center"}}>Absent</div><div style={{width:80,textAlign:"right"}}>Rate</div>
        </div>
        {sorted.map(s=>{
          const pct=active.length?Math.round((s.present||[]).length/active.length*100):0;
          return <div key={s.date} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:"1px solid #f0f4f9",fontSize:13}}>
            <div style={{flex:1,fontWeight:600,color:"#1e293b"}}>{fmt(s.date)}</div>
            <div style={{width:80,textAlign:"center",color:"#2e7d32",fontWeight:700}}>{(s.present||[]).length}</div>
            <div style={{width:80,textAlign:"center",color:"#c62828",fontWeight:600}}>{active.length-(s.present||[]).length}</div>
            <div style={{width:80,textAlign:"right"}}><span style={{fontWeight:700,color:pct>=80?"#2e7d32":pct>=60?"#f57f17":"#c62828"}}>{pct}%</span></div>
          </div>;
        })}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <SectionHeader emoji="👤" title="By Member"/>
      {byMember.map(({member:m,att,rate})=>(
        <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <Avatar member={m} size={32}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{m.firstName} {m.lastName}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{att} of {attendance.length} services</div>
          </div>
          <div style={{width:150}}>
            <div style={{background:"#e8eef6",borderRadius:6,height:10,overflow:"hidden"}}>
              <div style={{width:`${rate}%`,background:rate>=80?"#2e7d32":rate>=60?"#f57f17":"#c62828",height:"100%",borderRadius:6}}/>
            </div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:rate>=80?"#2e7d32":rate>=60?"#f57f17":"#c62828",minWidth:44,textAlign:"right"}}>{rate}%</div>
        </div>
      ))}
    </div>
  </div>;
}

function RptMembers({members}){
  const STATUSES=["Member","Visitor","Inactive","Transferred"];
  const STATUS_C={Member:{bg:"#e8f5e9",text:"#2e7d32",border:"#a5d6a7"},Visitor:{bg:"#fff8e1",text:"#f57f17",border:"#ffe082"},Inactive:{bg:"#fce4ec",text:"#c62828",border:"#ef9a9a"},Transferred:{bg:"#e8eaf6",text:"#283593",border:"#9fa8da"}};
  const ROLES=["Pastor","Co-Pastor","Deacon","Elder","Minister","Member","Visitor"];
  const ROLE_C={Pastor:"#1B4F8A","Co-Pastor":"#2E75B6",Deacon:"#4CAF50",Elder:"#7B1FA2",Minister:"#00897B",Member:"#546E7A",Visitor:"#F57C00"};
  const SOURCES=["Founded","Friend","Family","Community Outreach","Social Media","Walk-in","Online Search","Other"];
  const sorted=[...members].sort((a,b)=>(a.lastName||"").localeCompare(b.lastName||""));
  return <div className="slide-in">
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      {STATUSES.map(s=>{const cnt=members.filter(m=>m.status===s).length;const c=STATUS_C[s]||STATUS_C.Member;return(
        <div key={s} className="stat-card" style={{borderTop:`4px solid ${c.text}`,textAlign:"center"}}>
          <div style={{fontSize:26,fontWeight:800,color:c.text,fontFamily:"'Playfair Display',serif"}}>{cnt}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:4}}>{s}</div>
        </div>
      );})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="👤" title="By Role"/>
        {ROLES.map(r=>{const cnt=members.filter(m=>m.role===r).length;return cnt?<RptBar key={r} value={cnt} max={members.length||1} color={ROLE_C[r]||"#546E7A"} label={r} right={`${cnt}`}/>:null;}).filter(Boolean)}
      </div>
      <div className="card" style={{padding:22}}>
        <SectionHeader emoji="🚪" title="How They Found Us"/>
        {SOURCES.map(s=>{const cnt=members.filter(m=>m.visitorSource===s).length;return cnt?<RptBar key={s} value={cnt} max={members.length||1} color="#2E75B6" label={s} right={`${cnt}`}/>:null;}).filter(Boolean)}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <SectionHeader emoji="📋" title="Full Member Directory"/>
      <div style={{overflow:"hidden",borderRadius:8,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",padding:"8px 14px",background:"#f8fafc",fontWeight:700,fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #e2e8f0"}}>
          <div style={{flex:1.5}}>Name</div><div style={{width:90}}>Role</div><div style={{width:80}}>Status</div><div style={{flex:1}}>Phone</div><div style={{flex:1.5}}>Email</div><div style={{width:90}}>Joined</div>
        </div>
        {sorted.map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #f0f4f9",fontSize:12}}>
            <div style={{flex:1.5,fontWeight:600,color:"#1e293b"}}>{m.lastName}, {m.firstName}</div>
            <div style={{width:90,color:ROLE_C[m.role]||"#546E7A",fontWeight:600}}>{m.role}</div>
            <div style={{width:80}}><StatusBadge status={m.status}/></div>
            <div style={{flex:1,color:"#64748b"}}>{m.phone||"—"}</div>
            <div style={{flex:1.5,color:"#64748b"}}>{m.email||"—"}</div>
            <div style={{width:90,color:"#94a3b8"}}>{fmt(m.joinDate)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function RptGroups({members,groups,events}){
  const today=todayStr();
  return <div className="slide-in">
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
      {[["Total Groups",groups.length,"#1B4F8A"],["Total Enrolled",groups.reduce((s,g)=>s+(g.members||[]).length,0),"#2e7d32"],["Upcoming Events",events.filter(e=>(e.date||"")>=today).length,"#f57f17"]].map(([lb,v,c])=>(
        <div key={lb} className="stat-card" style={{borderTop:`4px solid ${c}`,textAlign:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:c,fontFamily:"'Playfair Display',serif"}}>{v}</div>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginTop:4}}>{lb}</div>
        </div>
      ))}
    </div>
    {groups.map(g=>{
      const leader=members.find(m=>m.id===g.leaderId);
      const gm=(g.members||[]).map(x=>({...x,member:members.find(m=>m.id===x.memberId)})).filter(x=>x.member);
      return <div key={g.id} className="card" style={{padding:22,marginBottom:14,borderLeft:`5px solid ${g.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#0d2d5e"}}>{g.name}</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{g.description}</div>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:g.color,background:`${g.color}18`,padding:"4px 12px",borderRadius:12}}>{gm.length} members</span>
        </div>
        {leader&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <Avatar member={leader} size={28}/>
          <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{leader.firstName} {leader.lastName}</span>
          <span style={{fontSize:11,color:"#94a3b8"}}>— Leader</span>
        </div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {gm.map(({member:m,groupRole})=>(
            <span key={m.id} style={{fontSize:11,fontWeight:600,background:"#f1f5f9",color:"#475569",padding:"4px 10px",borderRadius:20,border:"1px solid #e2e8f0"}}>{m.firstName} {m.lastName} · {groupRole}</span>
          ))}
        </div>
      </div>;
    })}
  </div>;
}

function ReportsModule({members,giving,attendance,groups,events}){
  const [tab,setTab]=useState("overview");
  const TABS=[["overview","📊 Overview"],["giving","💰 Giving"],["attendance","📋 Attendance"],["members","👥 Members"],["groups","⛪ Groups"]];
  return <div className="fade-in">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,color:"#0d2d5e"}}>📊 Reports & Export</div>
        <div style={{fontSize:13,color:"#64748b",marginTop:2}}>Church health data at a glance</div>
      </div>
      <button className="btn-primary" onClick={()=>window.print()}>🖨️ Print / Save PDF</button>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {TABS.map(([key,label])=>(
        <button key={key} onClick={()=>setTab(key)} className="tab-btn"
          style={{background:tab===key?"#1B4F8A":"#fff",color:tab===key?"#fff":"#64748b",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
          {label}
        </button>
      ))}
    </div>
    {tab==="overview"  &&<RptOverview   members={members} giving={giving} attendance={attendance} groups={groups}/>}
    {tab==="giving"    &&<RptGiving     members={members} giving={giving}/>}
    {tab==="attendance"&&<RptAttendance members={members} attendance={attendance}/>}
    {tab==="members"   &&<RptMembers    members={members}/>}
    {tab==="groups"    &&<RptGroups     members={members} groups={groups} events={events}/>}
  </div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App({handleLogout}){
  const [members,setMembers]=useState(initialMembers);
  const [giving,setGiving]=useState(initialGiving);
  const [attendance,setAttendance]=useState(initialAttendance);
  const [groups,setGroups]=useState(initialGroups);
  const [events,setEvents]=useState(initialEvents);
  const [messages,setMessages]=useState(initialMessages);
  const [navPage,setNavPage]=useState("dashboard");
  const [view,setView]=useState("list");
  const [selected,setSelected]=useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null);
  const [nextMemberId,setNextMemberId]=useState(initialMembers.length+1);
  const [nextGiftId,setNextGiftId]=useState(initialGiving.length+1);
  const [nextMsgId,setNextMsgId]=useState(initialMessages.length+1);
  const [nextGroupId,setNextGroupId]=useState(initialGroups.length+1);
  const [nextEventId,setNextEventId]=useState(initialEvents.length+1);
  const [toast,setToast]=useState(null);
  const [dbLoading,setDbLoading]=useState(true);

  // Current user (Pastor Baldwin for now)
  const currentUser=members[0];

  // Load all data from Supabase on mount
  useEffect(()=>{
    const loadAll = async () => {
      try {
        const [
          {data:mData},
          {data:gData},
          {data:aData},
          {data:grData},
          {data:eData},
          {data:msgData}
        ] = await Promise.all([
          supabase.from("members").select("*").order("last_name"),
          supabase.from("giving").select("*").order("date",{ascending:false}),
          supabase.from("attendance").select("*").order("date",{ascending:false}),
          supabase.from("groups").select("*").order("name"),
          supabase.from("events").select("*").order("date"),
          supabase.from("messages").select("*").order("date",{ascending:false}),
        ]);
        if(mData?.length) setMembers(mData);
        if(gData?.length) setGiving(gData);
        if(aData?.length) setAttendance(aData);
        if(grData?.length) setGroups(grData);
        if(eData?.length) setEvents(eData);
        if(msgData?.length) setMessages(msgData);
      } catch(e){ console.log("Supabase load error:",e); }
      setDbLoading(false);
    };
    loadAll();
  },[]);

  const showToast=(msg,color="#2e7d32")=>{setToast({msg,color});setTimeout(()=>setToast(null),3000);};
  const handleNav=page=>{setNavPage(page);setView("list");setSelected(null);};
  const handleSelect=m=>{setSelected(m);setView("detail");};
  const handleBack=()=>{setView("list");setSelected(null);};

  const handleSaveMember=async form=>{
    if(view==="edit"&&selected){
      const {data}=await supabase.from("members").update(form).eq("id",selected.id).select().single();
      const updated=data||{...form,id:selected.id};
      setMembers(ms=>ms.map(m=>m.id===selected.id?updated:m));
      setSelected(updated);setView("detail");showToast(`${form.firstName||form.first_name} ${form.lastName||form.last_name} updated ✓`);
    } else {
      const {data}=await supabase.from("members").insert(form).select().single();
      const nm=data||{...form,id:nextMemberId};
      setMembers(ms=>[...ms,nm]);setNextMemberId(n=>n+1);setSelected(nm);setView("detail");
      showToast(`${form.firstName||form.first_name} ${form.lastName||form.last_name} added ✓`);
    }
  };
  const handleDeleteMember=async ()=>{
    await supabase.from("members").delete().eq("id",deleteTarget.id);
    setMembers(ms=>ms.filter(m=>m.id!==deleteTarget.id));
    setDeleteTarget(null);setView("list");setSelected(null);showToast("Member removed","#c62828");
  };
  const handleAddGift=async gift=>{
    const {data}=await supabase.from("giving").insert(gift).select().single();
    const ng=data||{...gift,id:nextGiftId};
    setGiving(gs=>[ng,...gs]);setNextGiftId(n=>n+1);showToast(`Gift of $${gift.amount} logged ✓`);
  };
  const handleDeleteGift=async id=>{
    await supabase.from("giving").delete().eq("id",id);
    setGiving(gs=>gs.filter(g=>g.id!==id));showToast("Gift removed","#c62828");
  };
  const handleSaveService=async service=>{
    const ex=attendance.find(a=>a.date===service.date);
    if(ex){await supabase.from("attendance").update(service).eq("id",ex.id);}
    else{await supabase.from("attendance").insert(service);}
    setAttendance(as=>{const e=as.find(a=>a.date===service.date);return e?as.map(a=>a.date===service.date?service:a):[...as,service];});
    showToast(`Attendance saved for ${fmt(service.date)} ✓`);
  };
  const handleSaveGroup=async (form)=>{
    if(form.id){
      await supabase.from("groups").update(form).eq("id",form.id);
      setGroups(gs=>gs.map(g=>g.id===form.id?form:g));showToast(`${form.name} updated ✓`);
    } else {
      const {data}=await supabase.from("groups").insert(form).select().single();
      const ng=data||{...form,id:nextGroupId};
      setGroups(gs=>[...gs,ng]);setNextGroupId(n=>n+1);showToast(`${form.name} created ✓`);
    }
  };
  const handleDeleteGroup=async id=>{
    await supabase.from("groups").delete().eq("id",id);
    setGroups(gs=>gs.filter(g=>g.id!==id));showToast("Group removed","#c62828");
  };
  const handleSendMessage=async msg=>{
    const {data}=await supabase.from("messages").insert({...msg,type:msg.channel}).select().single();
    const nm=data||{...msg,id:nextMsgId,type:msg.channel};
    setMessages(ms=>[nm,...ms]);setNextMsgId(n=>n+1);showToast(`${msg.channel} sent to ${msg.to} ✓`);
  };
  const handleSaveEvent=async (form,editId)=>{
    if(editId){
      await supabase.from("events").update(form).eq("id",editId);
      setEvents(es=>es.map(e=>e.id===editId?{...form,id:editId}:e));showToast(`"${form.title}" updated ✓`);
    } else {
      const {data}=await supabase.from("events").insert(form).select().single();
      const ne=data||{...form,id:nextEventId};
      setEvents(es=>[...es,ne]);setNextEventId(n=>n+1);showToast(`"${form.title}" added ✓`);
    }
  };
  const handleDeleteEvent=async id=>{
    await supabase.from("events").delete().eq("id",id);
    setEvents(es=>es.filter(e=>e.id!==id));showToast("Event removed","#c62828");
  };

  const renderContent=()=>{
    if(navPage==="dashboard")  return <Dashboard members={members} giving={giving} attendance={attendance} groups={groups} events={events} onNav={handleNav}/>;
    if(navPage==="giving")     return <GivingModule members={members} giving={giving} onAddGift={handleAddGift} onDeleteGift={handleDeleteGift}/>;
    if(navPage==="attendance") return <AttendanceModule members={members} attendance={attendance} onSaveService={handleSaveService}/>;
    if(navPage==="groups")     return <GroupsModule members={members} groups={groups} onSaveGroup={handleSaveGroup} onDeleteGroup={handleDeleteGroup} currentUser={currentUser}/>;
    if(navPage==="comms")      return <CommsModule members={members} groups={groups} messages={messages} onSendMessage={handleSendMessage} currentUser={currentUser}/>;
    if(navPage==="calendar")   return <CalendarModule events={events} groups={groups} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent}/>;
    if(navPage==="reminders")  return <RemindersModule members={members} attendance={attendance} events={events}/>;
    if(navPage==="reports")    return <ReportsModule members={members} giving={giving} attendance={attendance} groups={groups} events={events}/>;
    if(navPage==="members"){
      if(view==="list")   return <MemberList members={members} onSelect={handleSelect} onAdd={()=>{setSelected(null);setView("add");}}/>;
      if(view==="detail") return <MemberDetail member={selected} onEdit={()=>setView("edit")} onDelete={()=>setDeleteTarget(selected)} onBack={handleBack}/>;
      if(view==="add")    return <MemberForm onSave={handleSaveMember} onCancel={handleBack} isEdit={false}/>;
      if(view==="edit")   return <MemberForm initial={selected} onSave={handleSaveMember} onCancel={()=>setView("detail")} isEdit/>;
    }
    return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:12}}><div style={{fontSize:48}}>🚧</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0d2d5e",fontWeight:700}}>Coming Soon</div><div style={{color:"#64748b",fontSize:14}}>This module is planned for an upcoming phase.</div></div>;
  };

  if(dbLoading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f0f4f9",flexDirection:"column",gap:16}}>
    <div style={{width:48,height:48,border:"4px solid #e0e7ef",borderTopColor:"#1B4F8A",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}></div>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#1B4F8A",fontWeight:700}}>Loading Living Water CRM...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
  </div>;

  return <>
    <FontLoader/>
    <div id="print-statement"></div>
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#f0f4f9"}}>
      <Sidebar active={navPage} onNav={handleNav} onLogout={handleLogout}/>
      <div style={{flex:1,overflow:"auto",padding:"28px 32px"}}>{renderContent()}</div>
      {toast&&<div style={{position:"fixed",bottom:28,right:28,background:toast.color,color:"#fff",padding:"12px 22px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"fadeIn 0.2s ease",zIndex:300}}>{toast.msg}</div>}
      {deleteTarget&&<ConfirmModal message={`Permanently remove ${deleteTarget.firstName} ${deleteTarget.lastName}? This cannot be undone.`} onConfirm={handleDeleteMember} onCancel={()=>setDeleteTarget(null)}/>}
    </div>
  </>;
}
