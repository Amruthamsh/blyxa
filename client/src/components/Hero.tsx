import Button from "./Button";

interface HeroProps {
  onShop: () => void;
  onDiscuss: () => void;
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12h15m0 0-6-6m6 6-6 6"
      />
    </svg>
  );
}

export default function Hero({ onShop, onDiscuss }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_12%_0%,#f4f7f4_0%,#faf8f5_46%,#f6efe2_100%)]" />
        <img
          src="/border-top.png"
          alt=""
          className="absolute -left-12 -top-10 w-[min(880px,95vw)] max-w-none opacity-[0.22] mix-blend-multiply select-none"
        />
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-moss-200/45 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-sand-200/60 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-moss-300/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-9 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-16 lg:pt-12">
        <div className="min-w-0 max-w-xl">
          {/* <span className="inline-flex items-center gap-2.5 rounded-full border border-moss-200/80 bg-white/70 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-moss-700 shadow-sm shadow-moss-900/5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
            Blyxa Plants Nursery
          </span> */}

          <h1 className="mt-6 font-serif text-[2.6rem] font-medium leading-[1.03] tracking-tight text-forest-950 sm:text-5xl lg:text-[3.6rem]">
            A calm collection
            <br />
            of <em className="italic text-moss-600">living</em> things.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-forest-900/65">
            Native saplings, gentle herbs and garden companions — hand-raised in
            our nursery and waiting to settle into your home. Come wander the
            collection. Take your time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onShop}
              className="group gap-2.5"
            >
              Explore the collection
              <ArrowIcon />
            </Button>
            <Button variant="secondary" size="lg" onClick={onDiscuss}>
              Say hello
            </Button>
          </div>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-5 border-t border-forest-900/10 pt-5">
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-forest-900/40">
                Grown
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-forest-900">
                With patience
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-forest-900/40">
                Sourced
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-forest-900">
                Native &amp; unique
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-forest-900/40">
                Delivered
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-forest-900">
                With care
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-full sm:max-w-[450px] lg:max-w-[440px]">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[3.25rem] bg-gradient-to-br from-moss-200/50 via-white/40 to-sand-200/60 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/80 bg-white p-2.5 shadow-[0_36px_90px_-38px_rgba(26,40,34,0.42)] sm:p-3">
            <div className="overflow-hidden rounded-[2.1rem] bg-sand-50">
              <img
                src="/logo1.jpeg"
                alt="Blyxa Plants Nursery — bringing the beauty of nature to your home and garden"
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* <div className="absolute -right-2 top-6 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-forest-950/10 backdrop-blur sm:-right-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-moss-600">
              In the nursery
            </p>
            <p className="mt-0.5 font-serif text-lg font-semibold text-forest-950">
              5 plant families
            </p>
          </div> */}
        </div>
      </div>
    </section>
  );
}
