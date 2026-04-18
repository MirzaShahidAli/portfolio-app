import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const css = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--black:#080808;--card:#111;--border:#1e1e1e;--white:#f0ede6;--muted:#666;--accent:#c8f065;--font-display:'Syne',sans-serif;--font-body:'DM Sans',sans-serif}
body{background:var(--black);color:var(--white);font-family:var(--font-body);min-height:100vh;display:flex;align-items:center;justify-content:center}
.login-bg{position:fixed;inset:0;background:radial-gradient(ellipse at 60% 20%,rgba(200,240,101,0.05) 0%,transparent 60%),radial-gradient(ellipse at 20% 80%,rgba(123,140,222,0.05) 0%,transparent 50%);pointer-events:none}
.login-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
.login-wrap{position:relative;z-index:1;width:100%;max-width:420px;padding:1.5rem}
.login-brand{text-align:center;margin-bottom:2.5rem}
.login-logo{font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--white);display:inline-block;margin-bottom:.5rem}
.login-logo span{color:var(--accent)}
.login-tagline{font-size:.78rem;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:2rem}
.login-title{font-family:var(--font-display);font-size:1.4rem;font-weight:800;margin-bottom:.4rem;letter-spacing:-.02em}
.login-sub{font-size:.85rem;color:var(--muted);margin-bottom:2rem;line-height:1.5}
.lf-group{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.1rem}
.lf-group label{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
.lf-group input{background:#0a0a0a;border:1px solid var(--border);border-radius:10px;padding:.85rem 1rem;color:var(--white);font-family:var(--font-body);font-size:.92rem;outline:none;transition:border-color .3s;width:100%}
.lf-group input:focus{border-color:var(--accent)}
.login-btn{width:100%;background:var(--accent);color:#080808;border:none;border-radius:10px;padding:1rem;font-family:var(--font-display);font-size:.95rem;font-weight:800;cursor:pointer;transition:all .3s;margin-top:.5rem;letter-spacing:.02em}
.login-btn:hover:not(:disabled){background:#d8ff75;transform:translateY(-1px)}
.login-btn:disabled{opacity:.7;cursor:not-allowed}
.login-err{background:rgba(255,107,74,.1);border:1px solid rgba(255,107,74,.3);color:#ff6b4a;border-radius:8px;padding:.75rem 1rem;font-size:.85rem;margin-top:1rem;text-align:center}
.login-footer{text-align:center;margin-top:1.5rem;font-size:.78rem;color:var(--muted)}
.login-footer a{color:var(--accent);text-decoration:none}
.login-footer a:hover{text-decoration:underline}
`;

export default function Login() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin");
    return () => document.head.removeChild(style);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!creds.username || !creds.password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/auth/login", creds);
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-bg" />
      <div className="login-grid" />
      <div className="login-wrap">
        <div className="login-brand">
          <div className="login-logo">
            moiz<span>.</span>shahid
          </div>
          <div className="login-tagline">Admin Portal</div>
        </div>
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">
            Sign in to view and manage contact submissions.
          </p>
          <form onSubmit={handleLogin}>
            <div className="lf-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="admin"
                value={creds.username}
                onChange={(e) =>
                  setCreds({ ...creds, username: e.target.value })
                }
                autoComplete="username"
              />
            </div>
            <div className="lf-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={creds.password}
                onChange={(e) =>
                  setCreds({ ...creds, password: e.target.value })
                }
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
            {error && <div className="login-err">{error}</div>}
          </form>
        </div>
        <div className="login-footer">
          <a href="/">← Back to portfolio</a>
        </div>
      </div>
    </>
  );
}
