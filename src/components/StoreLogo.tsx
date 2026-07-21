import { SafeImage } from "./SafeImage";

// شعار متجر صغير مستدير — يظهر حرف اسم المتجر إن لم يتوفر شعار
export function StoreLogo({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  const px = size === "sm" ? 24 : 40;
  return src ? (
    <SafeImage
      src={src}
      alt={`شعار ${name}`}
      width={px}
      height={px}
      className={`${cls} shrink-0 rounded-full object-contain bg-white border border-teal-700/10 p-0.5`}
      loading="lazy"
    />
  ) : (
    <span
      className={`${cls} shrink-0 rounded-full bg-teal-700/10 text-teal-700 font-bold flex items-center justify-center ${size === "sm" ? "text-xs" : "text-sm"}`}
      aria-hidden
    >
      {name.slice(0, 2)}
    </span>
  );
}
