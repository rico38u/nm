import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

app.use(cors());
app.use(express.json({limit:"2mb"}));

const db = new Database(path.join(__dirname,"socialhub.db"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS posts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  media_url TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS comments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS follows(
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(follower_id,following_id)
);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS likes(
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id,post_id)
);
`);

const uploadDir = path.join(__dirname,"uploads");
fs.mkdirSync(uploadDir,{recursive:true});
const upload = multer({dest: uploadDir});

const auth = (req,res,next)=>{
  try{
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({error:"Unauthorized"});
    req.user=jwt.verify(token,JWT_SECRET);
    next();
  }catch{return res.status(401).json({error:"Invalid token"});}
};

const demo = db.prepare("SELECT id FROM users LIMIT 1").get();
if(!demo){
  const insert=db.prepare("INSERT INTO users(username,display_name,email,password_hash,bio) VALUES(?,?,?,?,?)");
  insert.run("rico","Rico","rico@example.com","demo-password","SocialHub creator");
}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"SocialHub API",time:new Date().toISOString()}));

app.post("/api/auth/register",(req,res)=>{
  const {username,displayName,email,password}=req.body||{};
  if(!username||!displayName||!email||!password) return res.status(400).json({error:"Missing fields"});
  try{
    const info=db.prepare("INSERT INTO users(username,display_name,email,password_hash) VALUES(?,?,?,?)")
      .run(username,displayName,email,password);
    const token=jwt.sign({id:info.lastInsertRowid,username},JWT_SECRET,{expiresIn:"7d"});
    res.json({token,user:{id:info.lastInsertRowid,username,displayName,email}});
  }catch(e){res.status(409).json({error:"Username or email already exists"});}
});

app.post("/api/auth/login",(req,res)=>{
  const {login,password}=req.body||{};
  const user=db.prepare("SELECT * FROM users WHERE username=? OR email=?").get(login,login);
  if(!user || user.password_hash!==password) return res.status(401).json({error:"Invalid credentials"});
  const token=jwt.sign({id:user.id,username:user.username},JWT_SECRET,{expiresIn:"7d"});
  res.json({token,user:{id:user.id,username:user.username,displayName:user.display_name,email:user.email,avatar:user.avatar,bio:user.bio}});
});

app.get("/api/me",auth,(req,res)=>{
  const u=db.prepare("SELECT id,username,display_name,email,avatar,bio,created_at FROM users WHERE id=?").get(req.user.id);
  res.json(u);
});

app.get("/api/posts",auth,(req,res)=>{
  const posts=db.prepare(`
    SELECT p.id,p.body,p.media_url,p.created_at,u.username,u.display_name,u.avatar,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) likes,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) comments
    FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC LIMIT 100
  `).all();
  res.json(posts);
});

app.post("/api/posts",auth,(req,res)=>{
  const {body,mediaUrl=""}=req.body||{};
  if(!body?.trim()) return res.status(400).json({error:"Post body is required"});
  const info=db.prepare("INSERT INTO posts(user_id,body,media_url) VALUES(?,?,?)").run(req.user.id,body.trim(),mediaUrl);
  res.json({id:info.lastInsertRowid});
});

app.post("/api/posts/:id/like",auth,(req,res)=>{
  const postId=Number(req.params.id);
  const has=db.prepare("SELECT 1 FROM likes WHERE user_id=? AND post_id=?").get(req.user.id,postId);
  if(has) db.prepare("DELETE FROM likes WHERE user_id=? AND post_id=?").run(req.user.id,postId);
  else db.prepare("INSERT INTO likes(user_id,post_id) VALUES(?,?)").run(req.user.id,postId);
  const count=db.prepare("SELECT COUNT(*) c FROM likes WHERE post_id=?").get(postId).c;
  res.json({liked:!has,count});
});

app.post("/api/posts/:id/comments",auth,(req,res)=>{
  const {body}=req.body||{};
  if(!body?.trim()) return res.status(400).json({error:"Comment required"});
  const info=db.prepare("INSERT INTO comments(post_id,user_id,body) VALUES(?,?,?)").run(Number(req.params.id),req.user.id,body.trim());
  res.json({id:info.lastInsertRowid});
});

app.get("/api/users/:id", (req,res)=>{
  const u=db.prepare("SELECT id,username,display_name,avatar,bio,created_at FROM users WHERE id=?").get(Number(req.params.id));
  if(!u) return res.status(404).json({error:"Not found"});
  res.json(u);
});

app.post("/api/users/:id/follow",auth,(req,res)=>{
  const target=Number(req.params.id);
  if(target===req.user.id) return res.status(400).json({error:"Cannot follow yourself"});
  const has=db.prepare("SELECT 1 FROM follows WHERE follower_id=? AND following_id=?").get(req.user.id,target);
  if(has) db.prepare("DELETE FROM follows WHERE follower_id=? AND following_id=?").run(req.user.id,target);
  else db.prepare("INSERT INTO follows(follower_id,following_id) VALUES(?,?)").run(req.user.id,target);
  res.json({following:!has});
});

app.get("/api/messages/:userId",auth,(req,res)=>{
  const other=Number(req.params.userId);
  const rows=db.prepare(`
    SELECT id,sender_id,receiver_id,body,created_at FROM messages
    WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
    ORDER BY id ASC LIMIT 200
  `).all(req.user.id,other,other,req.user.id);
  res.json(rows);
});

app.post("/api/messages/:userId",auth,(req,res)=>{
  const {body}=req.body||{};
  if(!body?.trim()) return res.status(400).json({error:"Message required"});
  const info=db.prepare("INSERT INTO messages(sender_id,receiver_id,body) VALUES(?,?,?)")
    .run(req.user.id,Number(req.params.userId),body.trim());
  res.json({id:info.lastInsertRowid});
});

app.post("/api/uploads",auth,upload.single("file"),(req,res)=>{
  if(!req.file) return res.status(400).json({error:"No file"});
  res.json({filename:req.file.filename,originalName:req.file.originalname});
});

app.listen(PORT,()=>console.log(`SocialHub API running on http://localhost:${PORT}`));
