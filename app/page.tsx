import Link from "next/link";
import { clubConfig } from "@/club.config";
import { Wordmark } from "@/components/brand/Wordmark";
import { SmartImage } from "@/components/brand/SmartImage";
import { Button } from "@/components/ui/button";

const featurePreviews = [
  {
    eyebrow: "Dining",
    title: "Reserve a table in three taps.",
    body: "Browse menus, see who else is dining, and book the Main Dining Room, Grill Room, or Terrace from your phone.",
    photoKey: "dining" as const,
  },
  {
    eyebrow: "Golf",
    title: "Tee times you can see at a glance.",
    body: "Live availability across the week, foursome management, and one-tap weather for the Donald Ross course.",
    photoKey: "golf" as const,
  },
  {
    eyebrow: "Racquets",
    title: "Court reservations, simplified.",
    body: "Book Har-Tru courts, pickleball, and platform — invite opponents from the directory in a single flow.",
    photoKey: "courts" as const,
  },
  {
    eyebrow: "Family",
    title: "The summer pool, reimagined.",
    body: "Cabana reservations, swim lessons, and live wait times for the snack bar — designed for families.",
    photoKey: "pool" as const,
  },
];

export default function MarketingHome() {
  const photo = clubConfig.brand.photography;

  return (
    <div className="bg-[color:var(--color-surface-canvas)] text-[color:var(--color-text-primary)]">
      {/* ============== Top nav ============== */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <Wordmark
            size="sm"
            variant="inline"
            className="text-[color:var(--color-text-inverse)] [&_*]:text-[color:var(--color-text-inverse)]"
          />
          <nav className="hidden items-center gap-10 text-xs tracking-[var(--tracking-widest)] text-white/85 uppercase md:flex">
            <a href="#experience" className="transition-colors hover:text-white">
              Experience
            </a>
            <a href="#about" className="transition-colors hover:text-white">
              The Club
            </a>
            <a href="#visit" className="transition-colors hover:text-white">
              Visit
            </a>
          </nav>
          <Link
            href="/login"
            className="text-xs tracking-[var(--tracking-widest)] text-white/85 uppercase transition-colors hover:text-white"
          >
            Members →
          </Link>
        </div>
      </header>

      {/* ============== Hero ============== */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--color-surface-inverse)]">
        <SmartImage
          src={photo.hero}
          alt={`${clubConfig.name} clubhouse`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          fallbackLabel={`Photograph — ${clubConfig.name} clubhouse`}
        />
        {/* Editorial veil */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65"
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pt-44 pb-20 md:px-12 md:pb-28">
          <p className="mb-6 font-sans text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
            Established {clubConfig.foundingYear} · {clubConfig.location.city},{" "}
            {clubConfig.location.state}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-balance text-white md:text-7xl lg:text-[5.5rem]">
            {clubConfig.brand.tagline}
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed font-light text-white/80 md:text-lg">
            {clubConfig.brand.strap}
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild variant="accent" size="lg">
              <Link href="/login">Members' Sign In</Link>
            </Button>
            <a
              href="#experience"
              className="inline-flex h-14 items-center justify-center rounded-[var(--radius-sm)] border border-white/35 px-8 text-sm font-medium tracking-[0.06em] text-white uppercase transition-colors hover:bg-white/10"
            >
              Tour the Experience
            </a>
          </div>
        </div>
      </section>

      {/* ============== Member experience preview ============== */}
      <section id="experience" className="border-t border-[color:var(--color-border-subtle)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-40">
          <div className="mb-16 grid items-end gap-10 md:grid-cols-[2fr_1fr] md:gap-20">
            <div>
              <p className="eyebrow mb-6">The Member Experience</p>
              <h2 className="max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl lg:text-6xl">
                A century of tradition, in your pocket.
              </h2>
            </div>
            <p className="text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
              Designed for the way members actually use the club — from the first cup of coffee at
              the Grill Room to the last toast at a Holiday Gala.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
            {featurePreviews.map((f) => (
              <article key={f.eyebrow} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-surface-secondary)]">
                  <SmartImage
                    src={photo[f.photoKey] ?? photo.hero}
                    alt={f.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[var(--duration-cinematic)] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                    fallbackLabel={`Photograph — ${f.eyebrow}`}
                  />
                </div>
                <div className="mt-8 max-w-md space-y-4">
                  <p className="eyebrow">{f.eyebrow}</p>
                  <h3 className="font-serif text-2xl leading-tight tracking-tight md:text-[1.75rem]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                    {f.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============== About ============== */}
      <section
        id="about"
        className="bg-[color:var(--color-surface-inverse)] text-[color:var(--color-text-inverse)]"
      >
        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-24 md:grid-cols-2 md:gap-24 md:px-12 md:py-40">
          <div className="relative aspect-[4/5] overflow-hidden">
            <SmartImage
              src={photo.golf}
              alt={`The course at ${clubConfig.name}`}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
              fallbackLabel={`Photograph — The Course`}
            />
          </div>
          <div className="flex max-w-xl flex-col justify-center">
            <p className="mb-6 font-sans text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
              About the Club
            </p>
            <h2 className="font-serif text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">
              A {2026 - clubConfig.foundingYear}-year tradition, written by its members.
            </h2>
            <p className="mt-8 text-base leading-relaxed font-light text-white/80">
              {clubConfig.name} has welcomed Carolina families since {clubConfig.foundingYear}. A{" "}
              {clubConfig.golf.architect ?? "classic"}-designed course, eight Har-Tru tennis courts,
              an open-air pool, and a clubhouse that has seen four generations of members find their
              way home.
            </p>
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8">
              <div>
                <dt className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
                  Founded
                </dt>
                <dd className="mt-2 font-serif text-2xl">{clubConfig.foundingYear}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
                  Course
                </dt>
                <dd className="mt-2 font-serif text-2xl">
                  {clubConfig.golf.holes} holes · par {clubConfig.golf.par}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
                  Tennis
                </dt>
                <dd className="mt-2 font-serif text-2xl">
                  {clubConfig.courts.find((c) => c.type === "tennis")?.count ?? "—"} Har-Tru
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[var(--tracking-widest)] text-[color:var(--color-accent-soft)] uppercase">
                  Dining
                </dt>
                <dd className="mt-2 font-serif text-2xl">
                  {clubConfig.diningVenues.length} venues
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ============== Visit / login CTA ============== */}
      <section id="visit" className="border-t border-[color:var(--color-border-subtle)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="grid gap-16 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow mb-6">For Members</p>
              <h2 className="max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">
                Already a member? Step inside.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed font-light text-[color:var(--color-text-secondary)]">
                Sign in to view your reservations, book tee times, RSVP to events, and manage your
                house account.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/login">Members' Sign In →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============== Footer ============== */}
      <footer className="border-t border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-secondary)]">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr] md:px-12">
          <div className="space-y-6">
            <Wordmark size="md" variant="inline" />
            <p className="max-w-sm text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
              {clubConfig.brand.strap}
            </p>
          </div>
          <address className="text-sm leading-relaxed text-[color:var(--color-text-secondary)] not-italic">
            <div className="eyebrow mb-3">Visit</div>
            {clubConfig.location.addressLine1}
            <br />
            {clubConfig.location.city}, {clubConfig.location.state} {clubConfig.location.postalCode}
          </address>
          <div className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
            <div className="eyebrow mb-3">Members</div>
            <Link href="/login" className="hover:text-[color:var(--color-text-primary)]">
              Sign In
            </Link>
            <br />
            <a
              href="mailto:membership@chapelhillcc.com"
              className="hover:text-[color:var(--color-text-primary)]"
            >
              Membership Inquiries
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] border-t border-[color:var(--color-border-subtle)] px-6 py-6 text-xs text-[color:var(--color-text-muted)] md:px-12">
          © {new Date().getFullYear()} {clubConfig.name}. Established {clubConfig.foundingYear}.
        </div>
      </footer>
    </div>
  );
}
