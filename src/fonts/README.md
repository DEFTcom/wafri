# تفعيل خط العناوين المرخص (Fatimah Arabic أو Harir)

الخطان **itf Fatimah Arabic** و**Harir** تجاريان — النسخ بمواقع التحميل المجانية مقرصنة
واستخدامها بموقع تجاري مخاطرة قانونية. الخط الحالي المؤقت: Zain (مجاني مرخص من Google Fonts).

## بعد شراء الترخيص

1. ضع ملف الخط هنا باسم: `heading.woff2` (لو عندك otf/ttf حوّله لـ woff2 من cloudconvert.com)
2. افتح `src/app/layout.tsx` واستبدل كتلة الخط الحالية بـ:

```tsx
import localFont from "next/font/local";

const headingFont = localFont({
  src: "../fonts/heading.woff2",
  variable: "--font-heading",
});
```

3. احذف سطر `Zain` من الاستيراد — انتهى، كل العناوين تتحول تلقائياً.

## مصادر الشراء الرسمية

- Harir: https://tptq-arabic.com/fonts/harir
- Fatimah Arabic: Indian Type Foundry (itfoundry.com)
