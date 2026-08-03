import Link from "next/link";

interface RoleCardProps {
  title: string;
  subtitleLines: [string, string];
  href: string;
  iconSrc: string;
  iconAlt: string;
  iconClassName?: string;
}

export function RoleCard({
  title,
  subtitleLines,
  href,
  iconSrc,
  iconAlt,
  iconClassName,
}: RoleCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-white px-[54px] py-[82px] shadow-[0px_10px_20px_-5px_rgba(249,115,22,0.04)] transition-all hover:border-[#f97316]/20 hover:shadow-[0px_20px_40px_-10px_rgba(249,115,22,0.08)] focus:outline-none focus:ring-2 focus:ring-[#f97316]/40 focus:ring-offset-2"
      aria-label={`Pilih peran ${title}`}
    >
      <div className="relative flex size-20 items-center justify-center rounded-full bg-[#ffdbca]/10">
        <img
          src={iconSrc}
          alt={iconAlt}
          className={iconClassName ?? "h-7 w-auto object-contain"}
        />
      </div>
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold leading-7 text-[#121c28]">
        {title}
      </h3>
      <div className="text-center text-sm font-semibold leading-5 tracking-[0.7px] text-[#5c5f60]">
        <p>{subtitleLines[0]}</p>
        <p>{subtitleLines[1]}</p>
      </div>
    </Link>
  );
}
