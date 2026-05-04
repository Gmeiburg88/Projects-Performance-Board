import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const COOKIE_NAME = "dashboard_admin";
export async function requireAdmin(){const c=await cookies(); if(c.get(COOKIE_NAME)?.value!=="true") redirect("/login");}
export async function setAdminSession(){const c=await cookies(); c.set(COOKIE_NAME,"true",{httpOnly:true,sameSite:"lax",secure:false,path:"/"});}
export async function clearAdminSession(){const c=await cookies(); c.set(COOKIE_NAME,"",{httpOnly:true,sameSite:"lax",secure:false,path:"/",maxAge:0});}
