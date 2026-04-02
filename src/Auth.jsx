import { useState, useEffect } from "react";
import supabase from "./supabaseClient";



export { supabase };

export default function Auth({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setSigningIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>Loading...</div>;

  if (!session) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#1a2744"}}>
      <div style={{background:"white",borderRadius:12,padding:40,width:360,boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:22,fontWeight:700,color:"#1a2744"}}>Living Water Church In Christ</div>
          <div style={{fontSize:14,color:"#666",marginTop:4}}>Leadership Portal</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"#333",marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:"100%",padding:"10px 12px",border:"1px solid #ddd",borderRadius:6,fontSize:14,boxSizing:"border-box"}} />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"#333",marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:"100%",padding:"10px 12px",border:"1px solid #ddd",borderRadius:6,fontSize:14,boxSizing:"border-box"}} />
          </div>
          {error && <div style={{color:"red",fontSize:13,marginBottom:16}}>{error}</div>}
          <button type="submit" disabled={signingIn}
            style={{width:"100%",padding:"12px",background:"#1a2744",color:"white",border:"none",borderRadius:6,fontSize:15,fontWeight:600,cursor:"pointer"}}>
            {signingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );

  return <>{children(session, handleLogout)}</>;
}
