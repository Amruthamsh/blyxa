interface LogoProps {
  onDark?: boolean;
}

export default function Logo({ onDark = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-moss-50 ring-1 ring-moss-200/80">
        <img
          src="/logo1.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-[-2px] w-[190%] max-w-none -translate-x-1/2"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-[1.5rem] font-semibold tracking-tight ${
            onDark ? "text-sand-50" : "text-forest-950"
          }`}
        >
          Blyxa
        </span>
        <span
          className={`mt-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] ${
            onDark ? "text-sand-50/60" : "text-moss-600"
          }`}
        >
          Plants Nursery
        </span>
      </span>
    </span>
  );
}
