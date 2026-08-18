import { createContext,useContext,useState } from "react";
const AuthContext=createContext(null);
const TOKEN_KEY="learnify_token", USER_KEY="learnify_user";
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem(USER_KEY))||null}catch{return null}});const login=data=>{localStorage.setItem(TOKEN_KEY,data.token);localStorage.setItem(USER_KEY,JSON.stringify(data.user));setUser(data.user)};const logout=()=>{localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);setUser(null)};return <AuthContext.Provider value={{user,login,logout,isAuthenticated:!!user}}>{children}</AuthContext.Provider>}
export function useAuth(){return useContext(AuthContext)}
