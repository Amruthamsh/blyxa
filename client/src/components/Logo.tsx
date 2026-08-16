interface LogoProps {
  onDark?: boolean;
}

export default function Logo({ onDark = false }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-2 font-serif text-[1.55rem] font-semibold tracking-tight ${
        onDark ? "text-sand-50" : "text-forest-950"
      }`}
    >
      Blyxa
      {/* <span
        aria-hidden="true"
        className="mb-0.5 h-1 w-1 shrink-0 rounded-full bg-moss-500"
      /> */}
      <span className="text-[0.6em] font-medium tracking-wide text-moss-600">
        Plants Nursery
      </span>
    </span>
  );
}
