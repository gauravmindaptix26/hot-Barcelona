import Image from "next/image";
import Link from "next/link";
import RegistroSubmit from "./registro-submit";
import GenderToggle from "./gender-toggle";

const steps = [
  {
    number: "1",
    title: "Stage name, contacts, and description",
    note: "Select gender, add your display name, email, phone, and a short bio.",
    fields: [
      "Stage name",
      "Email (not public)",
      "Password",
      "Phone number",
      "Your age",
    ],
  },
  {
    number: "2",
    title: "Services, attributes, and attention",
    note: "Select your nationality, services, attributes, and languages.",
    fields: [
      "Nationality",
      "Services offered",
      "Physical attributes",
      "Attention level",
      "Special Filters",
      "Languages",
    ],
  },
  {
    number: "3",
    title: "Rates and schedules",
    note: "Set your rates and weekly availability by day.",
    fields: ["Rate 20 min", "Rate 30 min", "Rate 45 min", "Rate 60 min"],
  },
  {
    number: "5",
    title: "Service location",
    note: "Provide the address where you offer services.",
    fields: ["Address", "Map confirmation"],
  },
  {
    number: "6",
    title: "Ad type and payment",
    note: "Choose subscription, payment method, and optional banner.",
    fields: ["Subscription", "Payment method", "Featured banner"],
  },
];

const nationalityOptions = [
  "Cuban",
  "Dominican Republic",
  "Ecuadorian",
  "Spanish",
  "European",
  "French",
  "Greek",
  "Hungarian",
  "Italian",
  "Jamaicans",
  "Latina",
  "Moroccan",
  "Mexican",
  "Moldova",
  "Paraguayan",
  "Portuguese",
  "Puerto Rico",
  "Czech Republic",
  "Romanian",
  "Russian",
  "South American",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Uruguayan",
  "Valencian",
  "Venezuelan",
];

const serviceOptions = [
  "I accept all kinds of compliments",
  "Dinner and event companion",
  "Travel companion",
  "The black one",
  "Complete experience (fr)",
  "Full experience (fr) included, 30 min",
  "Full experience (fr) included",
  "Natural experience",
  "Complete experience (gr)",
  "Complete experience (gr) including 1h",
  "Complete experience (gr) including 30min ap",
  "Party girl",
  "Massages with a happy ending",
  "Body-to-body massages",
  "Erotic massages",
  "Relaxing massages",
  "Relaxing massages (soft)",
  "Stripper",
];

const attributeOptions = [
  "Perky butt",
  "Big",
  "Large and natural",
  "Young women. Escorts in Valencia",
  "Mulatto",
  "Natural",
  "Black",
  "Mature prostitutes in Valencia",
  "Outstanding. Big-bootied escorts in Valencia",
  "Submissive",
];

const attentionOptions = [
  "24 hours",
  "I accept Bizum",
  "I accept cards.",
  "Companion to couples",
  "Companion for Disabled People",
  "Female companion",
  "Travel Companion",
  "I am available on Sundays.",
  "I am available on Saturdays",
  "Cheap",
  "Dinners and events",
  "Home escorts",
  "Escorts Torrente",
  "Independent massage therapist",
  "Escort numbers",
];

const languageOptions = [
  "Spanish",
  "English",
  "French",
  "Portuguese",
  "Russian",
  "German",
  "Italian",
  "Romanian",
];

const specialFilterOptions = [
  "Available now in Valencia",
  "Show your face",
  "To meet without commitment",
  "Sexcam",
  "Video call",
];

const rate20Options = [
  "20 min. / €30",
  "20 min. / €35",
  "20 min. / €40",
  "20 min. / €45",
  "20 min. / €50",
  "20 min. / €55",
  "20 min. / €60",
  "20 min. / €65",
  "20 min. / €70",
  "20 min. / €75",
  "20 min. / €80",
  "20 min. / €85",
  "20 min. / €90",
  "20 min. / €95",
  "20 min. / €100",
];

const rate30Options = [
  "30 min. / €30",
  "30 min. / €40",
  "30 min. / €50",
  "30 min. / €60",
  "30 min. / €70",
  "30 min. / €80",
  "30 min. / €90",
  "30 min. / €100",
  "30 min. / €110",
  "30 min. / €120",
  "30 min. / €130",
  "30 min. / €140",
  "30 min. / €150",
  "30 min. / €160",
  "30 min. / €170",
  "30 min. / €180",
  "30 min. / €190",
  "30 min. / €200",
];

const rate45Options = [
  "45 min. / €30",
  "45 min. / €40",
  "45 min. / €50",
  "45 min. / €60",
  "45 min. / €70",
  "45 min. / €80",
  "45 min. / €90",
  "45 min. / €100",
  "45 min. / €110",
  "45 min. / €150",
  "45 min. / €160",
  "45 min. / €170",
  "45 min. / €180",
  "45 min. / €190",
];

const rate60Options = [
  "60 min. / €50",
  "60 min. / €60",
  "60 min. / €70",
  "60 min. / €80",
  "60 min. / €90",
  "60 min. / €100",
  "60 min. / €110",
  "60 min. / €120",
  "60 min. / €130",
  "60 min. / €140",
  "60 min. / €150",
  "60 min. / €160",
  "60 min. / €170",
  "60 min. / €180",
  "60 min. / €190",
  "60 min. / €200",
  "60 min. / €210",
  "60 min. / €220",
  "60 min. / €230",
];

const scheduleDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const scheduleOptions = [
  "Rest",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export default function RegistroEscortsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.2),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 pt-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
              Registration Studio
            </p>
            <h1
              className="text-4xl font-semibold sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Advertise in just 6 steps
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Create a premium profile, manage your ad, and reach your audience
              with a modern, secure workflow.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-black/40 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white/80 transition hover:text-white"
              >
                Go to main page
              </Link>
              <button className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110">
                Start Registration
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {[
                { label: "On/Off", icon: "⚡" },
                { label: "Modify", icon: "✏️" },
                { label: "Update", icon: "🖼️" },
                { label: "Recharge", icon: "🔋" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs uppercase tracking-[0.3em] text-white/70"
                >
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <Image
              src="/images/Frau in Body.jpg"
              alt="Registration"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,11,13,0.65),rgba(10,11,13,0)_55%)]" />
          </div>
        </section>

        <form id="registro-escorts-form">
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-[28px] border border-white/10 bg-[#0c0d10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Step 1 — Start your profile
                </h2>
                <GenderToggle />
                <div className="grid gap-3">
                  <input
                    name="stageName"
                    placeholder="Name you use to publish"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Your email (not public)"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="phone"
                    placeholder="Phone number for your ad"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="age"
                    type="number"
                    min={18}
                    max={80}
                    placeholder="Your age"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[26px] border border-white/10">
                <Image
                  src="/images/hot10.webp"
                  alt="Registration preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

          <section className="mx-auto w-full max-w-6xl px-6 pb-24">
            <div className="grid gap-6">
              {steps.slice(1).map((step) => (
              <div key={step.number} className="contents">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-lg font-semibold">
                      {step.number}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm text-white/60">{step.note}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {step.fields.map((field) => {
                        if (step.number === "3" && field === "Rate 20 min") {
                          return (
                            <select
                              key={field}
                              name="rate20"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Select rate 20 min
                              </option>
                              {rate20Options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "3" && field === "Rate 30 min") {
                          return (
                            <select
                              key={field}
                              name="rate30"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Select rate 30 min
                              </option>
                              {rate30Options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "3" && field === "Rate 45 min") {
                          return (
                            <select
                              key={field}
                              name="rate45"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Select rate 45 min
                              </option>
                              {rate45Options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "3" && field === "Rate 60 min") {
                          return (
                            <select
                              key={field}
                              name="rate60"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Select rate 60 min
                              </option>
                              {rate60Options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "2" && field === "Nationality") {
                          return (
                            <select
                              key={field}
                              name="nationality"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Your nationality
                              </option>
                              {nationalityOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "2" && field === "Services offered") {
                          return (
                            <select
                              key={field}
                              name="servicesOffered"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Your Services
                              </option>
                              {serviceOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (
                          step.number === "2" &&
                          field === "Physical attributes"
                        ) {
                          return (
                            <select
                              key={field}
                              name="physicalAttributes"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Your Attributes
                              </option>
                              {attributeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "2" && field === "Attention level") {
                          return (
                            <select
                              key={field}
                              name="attentionLevel"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Your attention
                              </option>
                              {attentionOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "2" && field === "Languages") {
                          return (
                            <select
                              key={field}
                              name="languages"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Your Languages
                              </option>
                              {languageOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "2" && field === "Special Filters") {
                          return (
                            <select
                              key={field}
                              name="specialFilters"
                              defaultValue=""
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="" disabled>
                                Special Filters
                              </option>
                              {specialFilterOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          );
                        }

                        if (step.number === "1" && field === "Stage name") {
                          return (
                            <input
                              key={field}
                              name="stageName"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Email (not public)") {
                          return (
                            <input
                              key={field}
                              name="email"
                              type="email"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Password") {
                          return (
                            <input
                              key={field}
                              name="password"
                              type="password"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Phone number") {
                          return (
                            <input
                              key={field}
                              name="phone"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Your age") {
                          return (
                            <input
                              key={field}
                              name="age"
                              type="number"
                              min={18}
                              max={80}
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "5" && field === "Address") {
                          return (
                            <input
                              key={field}
                              name="address"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "5" && field === "Map confirmation") {
                          return (
                            <input
                              key={field}
                              name="mapConfirmation"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "6" && field === "Subscription") {
                          return (
                            <input
                              key={field}
                              name="subscription"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "6" && field === "Payment method") {
                          return (
                            <input
                              key={field}
                              name="paymentMethod"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "6" && field === "Featured banner") {
                          return (
                            <input
                              key={field}
                              name="featuredBanner"
                              placeholder={field}
                              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        return (
                          <input
                            key={field}
                            placeholder={field}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                          />
                        );
                      })}
                      </div>
                    </div>
                  </div>
                </div>
                {step.number === "3" ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white">
                          4
                        </div>
                        <h3 className="text-xl font-semibold">
                          Weekly schedule
                        </h3>
                      </div>
                      <p className="text-sm text-white/60">
                        Set your schedule by day. If you do not work on a day,
                        select it as Rest.
                      </p>
                      <div className="mt-5 space-y-3">
                        {scheduleDays.map((day) => (
                          <div
                            key={day}
                            className="grid items-center gap-3 md:grid-cols-[140px_1fr_1fr_100px]"
                          >
                            <span className="text-sm font-semibold">{day}</span>
                            <select
                              defaultValue="Rest"
                              name={`schedule-${day}-start`}
                              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              {scheduleOptions.map((option) => (
                                <option
                                  key={`${day}-start-${option}`}
                                  value={option}
                                >
                                  {option}
                                </option>
                              ))}
                            </select>
                            <select
                              defaultValue="Rest"
                              name={`schedule-${day}-end`}
                              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              {scheduleOptions.map((option) => (
                                <option
                                  key={`${day}-end-${option}`}
                                  value={option}
                                >
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button className="h-12 rounded-xl border border-[#2ee35f] bg-[#2ee35f] px-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110">
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            </div>
          </section>

          <RegistroSubmit />
        </form>
      </main>
    </div>
  );
}
