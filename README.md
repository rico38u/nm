# SocialHub Pro

مشروع منصة تواصل اجتماعي كبيرة كبداية عملية قابلة للتوسع.

## المكونات
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite عبر better-sqlite3
- Authentication: JWT
- Upload API: Multer
- تصميم Responsive + Glassmorphism
- صفحات: الرئيسية، استكشاف، فيديو، رسائل، إشعارات، ملف شخصي، متجر، ألعاب، إعدادات.

## التشغيل

```bash
npm install
npm run dev
```

وفي نافذة ثانية:

```bash
npm run server
```

واجهة Vite تعمل افتراضياً على:
http://localhost:5173

الـ API يعمل افتراضياً على:
http://localhost:4000

## ملاحظات مهمة
الواجهة تحتوي على بيانات تجريبية مرئية لتجربة التصميم، بينما الـ API يوفر مسارات حقيقية للحسابات والمنشورات والتعليقات والإعجابات والمتابعة والرسائل والرفع.

قبل النشر العام:
1. غيّر JWT_SECRET إلى قيمة عشوائية قوية.
2. استبدل تخزين كلمات المرور الخام بتجزئة bcrypt/argon2.
3. أضف rate limiting وvalidation وCSRF/CORS policy مناسبة.
4. ضع تخزين الوسائط في S3/R2/Cloudinary أو خدمة ملفات موثوقة.
5. أضف WebSocket لرسائل وبث حي لحظي.
6. استخدم PostgreSQL عند التوسع بدلاً من SQLite.
