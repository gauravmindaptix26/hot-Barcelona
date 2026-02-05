"use client";

import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import NavIcon from "../../components/NavIcon";

const contactCards = [
  {
    title: "General Enquiries",
    description: "Concierge support for curated introductions and guidance.",
    icon: "M4 7h16M4 12h16M4 17h10",
  },
  {
    title: "Profile Support",
    description: "Updates, verification, and profile management requests.",
    icon: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0",
  },
  {
    title: "Booking / Access",
    description: "Private access, reservations, and VIP arrangements.",
    icon: "M4 6h16M7 12h10M10 18h4",
  },
  {
    title: "Business & Partnerships",
    description: "Brand collaborations, media, and strategic partnerships.",
    icon: "M4 6h16M4 12h16M4 18h16",
  },
];

const trustItems = [
  {
    title: "100% Discreet & Confidential",
    icon: "M12 3l7 4v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z",
  },
  {
    title: "Secure Communication",
    icon: "M4 7h16v10H4z M7 7v-2a5 5 0 0 1 10 0v2",
  },
  {
    title: "Premium Verified Platform",
    icon: "M12 2.5l2.2 4.6 5.1.8-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.8L12 2.5Z",
  },
];

const quickConnect = [
  { label: "Email", icon: "M4 6h16v12H4z M4 7l8 5 8-5" },
  { label: "Secure Chat", icon: "M4 5h16v10H7l-3 3V5Z" },
  { label: "WhatsApp", icon: "M6 18l-2 4 4-2a8 8 0 1 0-2-2Z" },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.25),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="relative overflow-hidden pb-12 pt-6">
          <Navbar />
          <div className="mx-auto mt-6 w-full max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
                Private Contact
              </p>
              <h1
                className="mt-4 text-4xl font-semibold sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Concierge & Contact
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                Reach a discreet concierge team for curated introductions, private
                requests, and premium access.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {contactCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, amount: 0.3 }}
                className="group rounded-[22px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#f5d68c]/40"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[#f5d68c] shadow-[0_12px_24px_rgba(245,179,92,0.2)]">
                    <NavIcon path={card.icon} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-1 text-sm text-white/70">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-[26px] border border-white/10 bg-white/5 p-8 shadow-[0_28px_55px_rgba(0,0,0,0.4)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                Contact Form
              </p>
              <h2
                className="mt-4 text-3xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Send a private request
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Our concierge will respond discreetly within 24 hours.
              </p>

              <form className="mt-8 grid gap-5">
                {[
                  { label: "Full Name", type: "text" },
                  { label: "Email Address", type: "email" },
                  { label: "Preferred City / Location", type: "text" },
                ].map((field) => (
                  <label key={field.label} className="group relative">
                    <input
                      type={field.type}
                      placeholder=" "
                      className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 pb-3 pt-6 text-sm text-white/90 outline-none transition focus:border-[#f5d68c]/60 focus:shadow-[0_0_0_1px_rgba(245,179,92,0.35)]"
                    />
                    <span className="pointer-events-none absolute left-4 top-4 text-xs uppercase tracking-[0.3em] text-white/50 transition peer-focus:-translate-y-2 peer-focus:text-[#f5d68c] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-white/40">
                      {field.label}
                    </span>
                  </label>
                ))}

                <label className="group relative">
                  <select
                    className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 pb-3 pt-6 text-sm text-white/90 outline-none transition focus:border-[#f5d68c]/60 focus:shadow-[0_0_0_1px_rgba(245,179,92,0.35)]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select purpose
                    </option>
                    <option>General Enquiries</option>
                    <option>Profile Support</option>
                    <option>Booking / Access</option>
                    <option>Business & Partnerships</option>
                  </select>
                  <span className="pointer-events-none absolute left-4 top-4 text-xs uppercase tracking-[0.3em] text-white/50 transition peer-focus:-translate-y-2 peer-focus:text-[#f5d68c]">
                    Contact Purpose
                  </span>
                </label>

                <label className="group relative">
                  <textarea
                    rows={4}
                    placeholder=" "
                    className="peer w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 pb-3 pt-6 text-sm text-white/90 outline-none transition focus:border-[#f5d68c]/60 focus:shadow-[0_0_0_1px_rgba(245,179,92,0.35)]"
                  />
                  <span className="pointer-events-none absolute left-4 top-4 text-xs uppercase tracking-[0.3em] text-white/50 transition peer-focus:-translate-y-2 peer-focus:text-[#f5d68c] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-white/40">
                    Message
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/60">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#f5d68c]" />
                  I consent to discreet communication and understand the privacy
                  policy.
                </label>

                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110"
                >
                  Send Request
                </button>
              </form>
            </motion.div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-white/10 bg-black/40 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                  Trust & Discretion
                </p>
                <div className="mt-6 space-y-4">
                  {trustItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#f5d68c]">
                        <NavIcon path={item.icon} />
                      </span>
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/45 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                  Quick Connect
                </p>
                <div className="mt-5 grid gap-3">
                  {quickConnect.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="group flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#f5d68c]/60 hover:text-white"
                    >
                      {item.label}
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#f5d68c] transition group-hover:shadow-[0_0_20px_rgba(245,179,92,0.35)]">
                        <NavIcon path={item.icon} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
