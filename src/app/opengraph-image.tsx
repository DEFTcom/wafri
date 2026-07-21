import { ImageResponse } from "next/og";

// صورة مشاركة افتراضية لأي صفحة ما لها صورة خاصة (الرئيسية، الفئات، البحث...)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori (محرك next/og) لا يدعم العربية بخط افتراضي — لازم نجيب خط عربي
// كملف ttf صريح. الحيلة: نتظاهر بمتصفح قديم لا يدعم woff2 حتى Google يرجع ttf
async function loadArabicFont() {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Cairo:wght@700;800&display=swap",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      },
    }
  ).then((r) => r.text());
  const url = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!url) return null;
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const fontData = await loadArabicFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e2b27",
          fontFamily: fontData ? "Cairo" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 130, fontWeight: 800, color: "#f7f3ec" }}>
          وفّري
          <span style={{ color: "#e4566b" }}>.</span>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#e3efec", marginTop: 20 }}>
          قارني أسعار منتجات العناية واشتري بأرخص سعر
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 48,
          }}
        >
          {["النهدي", "المتحدة", "نايس ون", "دار الأميرات", "وايتس"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                background: "#1d4e4a",
                color: "#f7f3ec",
                fontSize: 26,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Cairo", data: fontData, style: "normal", weight: 700 }]
        : undefined,
    }
  );
}
