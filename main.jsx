import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const icons = {
  home:"⌂", explore:"⌕", video:"▶", messages:"◌", bell:"●",
  profile:"◉", market:"▣", gaming:"◆", settings:"⚙", search:"⌕",
  plus:"+", heart:"♡", comment:"◌", share:"↗", bookmark:"🔖"
};

const seedPosts = [
  {
    id: 1,
    user: "Rico",
    handle: "@rico",
    avatar: "https://i.pravatar.cc/100?img=12",
    time: "منذ 8 دقائق",
    text: "أهلاً بكم في SocialHub Pro 🚀 مساحة واحدة للتواصل، الفيديو، المجتمعات، الألعاب والرسائل.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=80",
    likes: 128,
    comments: 23,
    shares: 9
  },
  {
    id: 2,
    user: "Nour",
    handle: "@nour.dev",
    avatar: "https://i.pravatar.cc/100?img=47",
    time: "منذ 35 دقيقة",
    text: "بدأت بناء مشروعي الجديد اليوم. مين حابب ينضم للمجتمع؟",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
    likes: 94,
    comments: 17,
    shares: 4
  }
];

const stories = [
  ["Rico", "https://i.pravatar.cc/120?img=12"],
  ["Nour", "https://i.pravatar.cc/120?img=47"],
  ["Kareem", "https://i.pravatar.cc/120?img=68"],
  ["Mona", "https://i.pravatar.cc/120?img=32"],
  ["Youssef", "https://i.pravatar.cc/120?img=13"],
  ["Sara", "https://i.pravatar.cc/120?img=44"]
];

function App(){
  const [active, setActive] = useState("home");
  const [posts, setPosts] = useState(seedPosts);
  const [query, setQuery] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [liked, setLiked] = useState({});
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(true);

  const notify = (t) => {
    setToast(t);
    setTimeout(()=>setToast(""),2200);
  };

  const nav = [
    ["home","الرئيسية"],
    ["explore","استكشاف"],
    ["video","الفيديو"],
    ["messages","الرسائل"],
    ["bell","الإشعارات"],
    ["profile","الملف الشخصي"],
    ["market","المتجر"],
    ["gaming","الألعاب"],
    ["settings","الإعدادات"]
  ];

  const publish = () => {
    const value = composerText.trim();
    if (!value) return;
    setPosts([{
      id: Date.now(),
      user: "Rico",
      handle: "@rico",
      avatar: "https://i.pravatar.cc/100?img=12",
      time: "الآن",
      text: value,
      likes: 0, comments: 0, shares: 0
    }, ...posts]);
    setComposerText("");
    setShowComposer(false);
    notify("تم نشر المنشور");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q ? posts : posts.filter(p =>
      (p.text+p.user+p.handle).toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className={dark ? "app dark" : "app light"}>
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <b>SocialHub</b>
            <small>PRO PLATFORM</small>
          </div>
        </div>
        <div className="profile-mini">
          <img src="https://i.pravatar.cc/100?img=12"/>
          <div><b>Rico</b><span>@rico</span></div>
          <button onClick={()=>setActive("profile")}>›</button>
        </div>
        <nav>
          {nav.map(([key,label]) =>
            <button key={key} className={active===key?"nav active":"nav"} onClick={()=>setActive(key)}>
              <span>{icons[key]}</span><label>{label}</label>
            </button>
          )}
        </nav>
        <button className="create-btn" onClick={()=>setShowComposer(true)}>
          <span>{icons.plus}</span> إنشاء
        </button>
        <div className="side-bottom">
          <div className="online-dot"></div> الخدمة تعمل
          <button className="theme-btn" onClick={()=>setDark(!dark)}>{dark?"☀":"☾"}</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar glass">
          <div className="mobile-brand">SocialHub</div>
          <div className="search">
            <span>{icons.search}</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث عن أشخاص، فيديوهات، مجتمعات..." />
          </div>
          <div className="header-actions">
            <button className="round" onClick={()=>notify("لا توجد تنبيهات جديدة")}>🔔</button>
            <button className="avatar-btn" onClick={()=>setActive("profile")}><img src="https://i.pravatar.cc/80?img=12"/></button>
          </div>
        </header>

        {active==="home" &&
          <Home posts={filtered} stories={stories} liked={liked} setLiked={setLiked} notify={notify} />
        }
        {active==="explore" && <Explore notify={notify}/>}
        {active==="video" && <VideoHub notify={notify}/>}
        {active==="messages" && <Messages notify={notify}/>}
        {active==="bell" && <Notifications/>}
        {active==="profile" && <Profile posts={posts} setActive={setActive}/>}
        {active==="market" && <Marketplace notify={notify}/>}
        {active==="gaming" && <Gaming notify={notify}/>}
        {active==="settings" && <Settings notify={notify}/>}
      </main>

      <aside className="rightbar">
        <section className="widget glass">
          <div className="widget-head"><b>المجتمعات</b><button onClick={()=>setActive("explore")}>عرض الكل</button></div>
          {["مبرمجون عرب","Gaming Zone","مصممو الويب","صناع المحتوى"].map((x,i)=>
            <div className="community" key={x}>
              <div className={"community-icon c"+i}>{["</>","◆","◈","✦"][i]}</div>
              <div><b>{x}</b><span>{(12+i*8)+"K أعضاء"}</span></div>
              <button onClick={()=>notify("تم الانضمام إلى "+x)}>انضمام</button>
            </div>
          )}
        </section>
        <section className="widget glass">
          <div className="widget-head"><b>الأكثر انتشاراً</b><span>اليوم</span></div>
          {["#SocialHub","#برمجة","#Gaming","#تصميم","#فيديو"].map((x,i)=>
            <div className="trend" key={x}><span>0{i+1}</span><div><b>{x}</b><small>{12+i*7}.4K منشور</small></div></div>
          )}
        </section>
      </aside>

      {showComposer &&
        <div className="modal-backdrop" onClick={()=>setShowComposer(false)}>
          <div className="composer modal glass" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h2>إنشاء منشور</h2><button onClick={()=>setShowComposer(false)}>×</button></div>
            <div className="composer-user"><img src="https://i.pravatar.cc/80?img=12"/><div><b>Rico</b><span>منشور عام</span></div></div>
            <textarea autoFocus value={composerText} onChange={e=>setComposerText(e.target.value)} placeholder="بماذا تفكر؟"></textarea>
            <div className="composer-tools">
              <button>🖼 صورة</button><button>🎥 فيديو</button><button>😊 شعور</button><button>📍 موقع</button>
            </div>
            <button className="publish" onClick={publish}>نشر الآن</button>
          </div>
        </div>
      }

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Home({posts,stories,liked,setLiked,notify}){
  return <div className="content-grid">
    <div className="feed">
      <section className="stories glass">
        <div className="stories-title"><b>القصص</b><button>مشاهدة الكل</button></div>
        <div className="story-row">
          {stories.map(([name,img],i)=>
            <div className="story" key={name} onClick={()=>notify("فتح قصة "+name)}>
              <div className={"story-ring "+(i===0?"mine":"")}><img src={img}/>{i===0&&<span>+</span>}</div>
              <small>{name}</small>
            </div>
          )}
        </div>
      </section>
      <div className="composer-short glass" onClick={()=>document.querySelector(".create-btn")?.click()}>
        <img src="https://i.pravatar.cc/80?img=12"/>
        <span>بماذا تفكر يا Rico؟</span>
        <button>＋</button>
      </div>
      {posts.map(p=><Post key={p.id} p={p} liked={liked[p.id]} setLiked={setLiked} notify={notify}/>)}
    </div>
    <div className="feed-secondary">
      <section className="live-card glass">
        <div className="live-badge">● مباشر</div>
        <h3>البث المباشر</h3>
        <p>شاهد أحدث البثوث من صناع المحتوى.</p>
        <button onClick={()=>notify("ميزة البث جاهزة للربط بالخادم")}>استكشف البث</button>
      </section>
      <section className="suggest glass">
        <div className="widget-head"><b>أشخاص قد تعرفهم</b><button>عرض الكل</button></div>
        {[["Omar","31"],["Mira","21"],["Adam","55"]].map(([n,img])=>
          <div className="suggest-row" key={n}><img src={"https://i.pravatar.cc/70?img="+img}/><div><b>{n}</b><span>مبرمج ومبدع</span></div><button onClick={()=>notify("تم إرسال طلب متابعة إلى "+n)}>＋</button></div>
        )}
      </section>
    </div>
  </div>
}

function Post({p,liked,setLiked,notify}){
  return <article className="post glass">
    <div className="post-head">
      <img src={p.avatar}/>
      <div className="post-user"><b>{p.user}</b><span>{p.handle} · {p.time}</span></div>
      <button className="more">•••</button>
    </div>
    <p className="post-text">{p.text}</p>
    {p.image && <img className="post-media" src={p.image}/>}
    <div className="stats"><span>{p.likes+(liked?1:0)} إعجاب</span><span>{p.comments} تعليق · {p.shares} مشاركة</span></div>
    <div className="post-actions">
      <button className={liked?"liked":""} onClick={()=>setLiked(v=>({...v,[p.id]:!v[p.id]}))}>{liked?"♥":"♡"} إعجاب</button>
      <button onClick={()=>notify("فتح التعليقات")}>◌ تعليق</button>
      <button onClick={()=>notify("تم نسخ رابط المشاركة")}>↗ مشاركة</button>
      <button onClick={()=>notify("تم حفظ المنشور")}>🔖 حفظ</button>
    </div>
  </article>
}

function Explore({notify}){
  const topics=["الألعاب","التقنية","الذكاء الاصطناعي","الرياضة","التصميم","البرمجة","الموسيقى","السفر"];
  return <div className="page">
    <div className="page-title"><div><h1>استكشاف</h1><p>اكتشف محتوى جديداً ومجتمعات وأشخاصاً.</p></div><button className="primary" onClick={()=>notify("تم تحديث الاستكشاف")}>تحديث</button></div>
    <div className="topic-grid">{topics.map((x,i)=><div className="topic glass" key={x} onClick={()=>notify("استكشاف "+x)}><span>{["🎮","⚡","🤖","⚽","🎨","💻","🎵","✈️"][i]}</span><b>{x}</b><small>{20+i*7}K متابع</small></div>)}</div>
    <div className="section-label">المحتوى الرائج</div>
    <div className="explore-grid">{Array.from({length:8},(_,i)=><div className="explore-card glass" key={i}><img src={`https://picsum.photos/seed/hub${i}/600/600`}/><div><b>محتوى مقترح #{i+1}</b><span>12K تفاعل</span></div></div>)}</div>
  </div>
}

function VideoHub({notify}){
  return <div className="page">
    <div className="page-title"><div><h1>الفيديو</h1><p>فيديوهات قصيرة وطويلة وبثوث مباشرة.</p></div><button className="primary" onClick={()=>notify("رفع الفيديو يحتاج إلى API التخزين")}>＋ رفع فيديو</button></div>
    <div className="video-grid">{Array.from({length:9},(_,i)=><div className="video-card glass" key={i} onClick={()=>notify("تشغيل الفيديو "+(i+1))}><div className="video-thumb"><img src={`https://picsum.photos/seed/video${i}/800/520`}/><span>▶</span><em>{2+i}:4{i}</em></div><div className="video-info"><img src={"https://i.pravatar.cc/60?img="+(20+i)}/><div><b>فيديو جديد في SocialHub #{i+1}</b><small>{10+i*2}K مشاهدة · منذ {i+1} ساعة</small></div></div></div>)}</div>
  </div>
}

function Messages({notify}){
  const people=[["Omar","31","هل وصلت الملفات؟"],["Mira","21","شفت التصميم الجديد؟"],["Adam","55","نبدأ المشروع الليلة"],["Sara","44","تمام، شكراً"],["Nour","47","أرسلت لك الرابط"]];
  const [selected,setSelected]=useState(0);
  const [msg,setMsg]=useState("");
  return <div className="messages-page glass">
    <div className="chat-list"><div className="chat-top"><h2>الرسائل</h2><button onClick={()=>notify("إنشاء محادثة جديدة")}>＋</button></div><div className="chat-search">⌕ <input placeholder="بحث في الرسائل"/></div>{people.map((p,i)=><div className={"chat-item "+(selected===i?"selected":"")} onClick={()=>setSelected(i)} key={p[0]}><img src={`https://i.pravatar.cc/80?img=${p[1]}`}/><div><b>{p[0]}</b><span>{p[2]}</span></div><small>{i+1}م</small></div>)}</div>
    <div className="chat-window"><div className="chat-head"><img src={`https://i.pravatar.cc/80?img=${people[selected][1]}`}/><div><b>{people[selected][0]}</b><span>متصل الآن</span></div><button>•••</button></div><div className="chat-body"><div className="bubble other">أهلاً 👋 كيف حالك؟</div><div className="bubble me">تمام، جاهز نبدأ.</div><div className="bubble other">{people[selected][2]}</div></div><div className="chat-input"><button>＋</button><input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){notify("تم إرسال الرسالة");setMsg("")}}} placeholder="اكتب رسالة..."/><button onClick={()=>{if(msg.trim()){notify("تم إرسال الرسالة");setMsg("")}}}>➤</button></div></div>
  </div>
}

function Notifications(){
  const data=[["Nour","أعجبت بمنشورك","47"],["Omar","بدأ بمتابعتك","31"],["SocialHub","تم إطلاق تحديث جديد","12"]];
  return <div className="page"><div className="page-title"><div><h1>الإشعارات</h1><p>آخر النشاطات على حسابك.</p></div></div><section className="notifications glass">{data.map((n,i)=><div className="notification" key={n[0]}><img src={"https://i.pravatar.cc/80?img="+n[2]}/><div><b>{n[0]}</b><p>{n[1]}</p><small>{i+1} ساعة</small></div><span>{["♥","＋","⚡"][i]}</span></div>)}</section></div>
}

function Profile({posts,setActive}){
  return <div className="profile-page">
    <section className="profile-cover glass"><div className="cover-art"></div><div className="profile-main"><img className="profile-avatar" src="https://i.pravatar.cc/160?img=12"/><div className="profile-data"><h1>Rico</h1><span>@rico · مطور ومبدع</span><p>أبني تجارب رقمية وأحب البرمجة والألعاب.</p><div className="profile-stats"><b>12.8K <small>متابع</small></b><b>684 <small>يتابع</small></b><b>1.2K <small>منشور</small></b></div></div><button className="primary" onClick={()=>setActive("settings")}>تعديل الملف</button></div><div className="profile-tabs"><button className="active">المنشورات</button><button>الوسائط</button><button>الإعجابات</button><button>المجتمعات</button></div></section>
    <div className="profile-posts">{posts.slice(0,2).map(p=><PostStatic key={p.id} p={p}/>)}</div>
  </div>
}
function PostStatic({p}){ return <article className="post glass"><div className="post-head"><img src={p.avatar}/><div className="post-user"><b>{p.user}</b><span>{p.handle} · {p.time}</span></div></div><p className="post-text">{p.text}</p>{p.image&&<img className="post-media" src={p.image}/>}<div className="stats"><span>{p.likes} إعجاب</span><span>{p.comments} تعليق · {p.shares} مشاركة</span></div></article> }

function Marketplace({notify}){
  const items=["هاتف ذكي","سماعة لاسلكية","لابتوب","كرسي ألعاب","كاميرا","شاشة 4K","لوحة مفاتيح","ماوس احترافي"];
  return <div className="page"><div className="page-title"><div><h1>المتجر</h1><p>مساحة تجارة داخل المنصة.</p></div><button className="primary" onClick={()=>notify("تم فتح لوحة البائع")}>بيع منتج</button></div><div className="product-grid">{items.map((x,i)=><div className="product-card glass" key={x}><img src={`https://picsum.photos/seed/product${i}/500/400`}/><div><small>تقنية وأجهزة</small><b>{x}</b><strong>{(699+i*230)+" ج.م"}</strong></div><button onClick={()=>notify("أضيف إلى السلة")}>أضف للسلة</button></div>)}</div></div>
}

function Gaming({notify}){
  const games=["Neon Arena","City Drive","Sky Clash","Battle Core","Rally X","Pixel Kingdom"];
  return <div className="page"><div className="page-title"><div><h1>الألعاب</h1><p>مركز الألعاب والمجتمعات والتحديات.</p></div><button className="primary" onClick={()=>notify("فتح مكتبة الألعاب")}>مكتبتي</button></div><div className="game-hero glass"><div><span className="eyebrow">حدث هذا الأسبوع</span><h2>NEON ARENA</h2><p>تنافس مع لاعبين من مجتمع SocialHub.</p><button className="primary" onClick={()=>notify("بدء اللعبة")}>العب الآن</button></div></div><div className="game-grid">{games.map((g,i)=><div className="game-card glass" key={g}><img src={`https://picsum.photos/seed/game${i}/600/420`}/><div><b>{g}</b><small>متصل الآن: {1+i*2}.4K لاعب</small></div><button onClick={()=>notify("فتح صفحة "+g)}>فتح</button></div>)}</div></div>
}

function Settings({notify}){
  const [privacy,setPrivacy]=useState(true);
  return <div className="page"><div className="page-title"><div><h1>الإعدادات</h1><p>إدارة الحساب والخصوصية والتنبيهات.</p></div></div><div className="settings-layout"><div className="settings-menu glass">{["الحساب","الخصوصية","الأمان","الإشعارات","المظهر","المحتوى"].map((x,i)=><button className={i===0?"active":""} key={x}>{x}</button>)}</div><div className="settings-panel glass"><h2>الحساب والخصوصية</h2><Setting label="حساب عام" value={privacy} setValue={setPrivacy}/><Setting label="إشعارات الرسائل" value={true}/><Setting label="إظهار الحالة النشطة" value={true}/><Setting label="السماح بطلبات المتابعة" value={true}/><button className="danger" onClick={()=>notify("هذا زر تجريبي لتسجيل الخروج")}>تسجيل الخروج</button></div></div></div>
}
function Setting({label,value,setValue}){const [v,setV]=useState(!!value); return <div className="setting-row"><div><b>{label}</b><span>إعداد المنصة</span></div><button className={"switch "+(v?"on":"")} onClick={()=>{setV(!v);setValue?.(!v)}}><span></span></button></div>}

createRoot(document.getElementById("root")).render(<App/>)
