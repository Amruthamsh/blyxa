import Button from "./Button";
import PlantIllustration from "./PlantIllustration";

interface HeroProps {
  onShop: () => void;
  onDiscuss: () => void;
}

export default function Hero({ onShop, onDiscuss }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-8 pb-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-14 lg:pb-10 lg:px-8">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-moss-600">
            Handcrafted botanicals
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-forest-950 sm:text-5xl lg:text-[3.5rem]">
            Bring a little
            <br />
            more <em className="italic text-moss-600">green</em> home.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-forest-900/60">
            Thoughtfully grown, carefully potted plants delivered healthy to
            your doorstep — with personal care advice from our plant people.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={onShop}>
              Shop plants
            </Button>
            <Button variant="secondary" size="lg" onClick={onDiscuss}>
              Chat with us
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-forest-900/10 pt-6">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-forest-900/45">
                Handpicked
              </dt>
              <dd className="mt-1 text-sm font-semibold text-forest-900">
                Healthy plants
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-forest-900/45">
                Packaging
              </dt>
              <dd className="mt-1 text-sm font-semibold text-forest-900">
                Eco-friendly
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-forest-900/45">
                Support
              </dt>
              <dd className="mt-1 text-sm font-semibold text-forest-900">
                Care advice
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-sm lg:max-w-[420px]">
          <div className="relative aspect-[4/4] w-full overflow-hidden rounded-3xl border border-forest-900/10 bg-gradient-to-b from-moss-100 to-moss-200/70 sm:aspect-[5/5] lg:aspect-[4/5]">
            <PlantIllustration className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
