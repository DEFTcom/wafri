// شريط متحرك بسطر واحد — المحتوى يتكرر مرتين لحركة لا نهائية سلسة
export function Marquee({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`marquee ${className}`} aria-hidden={false}>
      <div className="marquee-track">
        <div className="inline-flex items-center" dir="rtl">
          {children}
        </div>
        <div className="inline-flex items-center" dir="rtl" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
