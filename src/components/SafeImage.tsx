import Image, { type ImageProps } from "next/image";
import { isSafeImageHost } from "@/lib/image-hosts";

// بديل عن next/image يتحمّل صورة من نطاق غير مُدرج بـ remotePatterns بدل ما
// يرمي خطأ يوقف الصفحة كاملة — يرجع لـ <img> عادية بذاك النطاق تحديداً.
export function SafeImage({ src, alt, ...rest }: ImageProps) {
  if (typeof src === "string" && !isSafeImageHost(src)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- نستبعدهما فقط، ما يصلحان لـ <img> عادية
    const { fill, className, sizes, priority, loading, ...imgRest } = rest;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- نطاق خارجي غير مُدرج بـ next.config
      <img
        src={src}
        alt={alt}
        loading={loading === "eager" ? "eager" : "lazy"}
        className={fill ? `absolute inset-0 h-full w-full ${className ?? ""}` : className}
        {...(typeof imgRest.width === "number" && { width: imgRest.width })}
        {...(typeof imgRest.height === "number" && { height: imgRest.height })}
      />
    );
  }
  return <Image src={src} alt={alt} {...rest} />;
}
