import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Package, ArrowLeftRight, ClipboardList, Users,
  Building2, BarChart3, UserCog, Shield, User, ChevronDown, ChevronRight, Box
} from "lucide-react";

const menu = [
  { label:"Inicio",             icon:Home,           path:"/home" },
  { label:"Productos",          icon:Package,        sub:[
    { label:"Catálogo",           path:"/catalogo"  },
    { label:"Buscar productos",   path:"/products"  },
  ]},
  { label:"Movimientos",        icon:ArrowLeftRight, sub:[
    { label:"Entradas",           path:"/entradas"  },
    { label:"Salidas",            path:"/salidas"   },
  ]},
  { label:"Órdenes de compra",  icon:ClipboardList,  sub:[
    { label:"Consultar órdenes",  path:"/ordenes"       },
    { label:"Nueva orden",        path:"/ordenes/nueva" },
  ]},
  { label:"Clientes",           icon:Users,          path:"/clientes" },
  { label:"Inventario",         icon:Box,            path:"/consultas"   },
  { label:"Proveedores",        icon:Building2,      path:"/proveedores" },
  { label:"Reportes",           icon:BarChart3,      sub:[
    { label:"Entradas",           path:"/reportes?tipo=entradas"   },
    { label:"Salidas",            path:"/reportes?tipo=salidas"    },
    { label:"Valorización",       path:"/reportes?tipo=inventario" },
    { label:"Kardex",             path:"/reportes?tipo=kardex"     },
    { label:"Movimientos",        path:"/reportes?tipo=movimientos"},
  ]},
  { label:"Usuarios",           icon:UserCog,        path:"/usuarios"  },
  { label:"Auditoría",          icon:Shield,         path:"/auditoria" },
  { label:"Mi perfil",          icon:User,           path:"/perfil"    },
];

export default function Sidebar({ open, setOpen }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [expanded, setExpanded] = useState({ Reportes: true });

  const toggle = (label) => setExpanded(p=>({...p,[label]:!p[label]}));
  const goTo   = (path)  => { navigate(path); setOpen(false); };
  const active = (path)  => {
    const [base, query] = path.split("?");
    return query
      ? location.pathname===base && location.search===`?${query}`
      : location.pathname===path;
  };

  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={s.overlay}/>}
      <div style={{...s.sidebar,transform:open?"translateX(0)":"translateX(-100%)"}}>
        <div style={s.header}>
          <div style={s.logoBox}>
            <Package size={18} color="#93C5FD" />
          </div>
          <span style={s.brand}>SGI</span>
        </div>
        <nav style={{padding:"8px 0"}}>
          {menu.map(item=>{
            const Icon = item.icon;
            return (
              <div key={item.label}>
                {item.path ? (
                  <div onClick={()=>goTo(item.path)}
                    style={{...s.item,...(active(item.path)?s.itemActive:{})}}>
                    <Icon size={16} style={{flexShrink:0}} />
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <>
                    <div onClick={()=>toggle(item.label)} style={s.item}>
                      <Icon size={16} style={{flexShrink:0}} />
                      <span style={{flex:1}}>{item.label}</span>
                      {expanded[item.label] ? <ChevronDown size={12} style={{opacity:0.5}} /> : <ChevronRight size={12} style={{opacity:0.5}} />}
                    </div>
                    {expanded[item.label] && (
                      <div style={s.submenu}>
                        {item.sub.map(sub=>(
                          <div key={sub.path} onClick={()=>goTo(sub.path)}
                            style={{...s.subitem,...(active(sub.path)?s.subitemActive:{})}}>
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

const s = {
  overlay:      {position:"fixed",top:52,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.4)",zIndex:998},
  sidebar:      {position:"fixed",top:52,left:0,width:224,height:"calc(100% - 52px)",background:"#111827",zIndex:999,transition:"transform 0.25s ease",overflowY:"auto"},
  header:       {padding:"1.25rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10},
  logoBox:      {width:32,height:32,background:"rgba(59,130,246,0.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"},
  brand:        {fontSize:16,fontWeight:600,color:"#F9FAFB",letterSpacing:0.5},
  item:         {display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.6)",borderRadius:6,margin:"1px 8px",transition:"all 0.15s"},
  itemActive:   {background:"rgba(59,130,246,0.15)",color:"#93C5FD"},
  submenu:      {paddingBottom:4},
  subitem:      {padding:"7px 14px 7px 46px",cursor:"pointer",fontSize:12,color:"rgba(255,255,255,0.45)",borderRadius:6,margin:"1px 8px",transition:"all 0.15s"},
  subitemActive:{color:"#93C5FD",background:"rgba(59,130,246,0.1)"},
};
