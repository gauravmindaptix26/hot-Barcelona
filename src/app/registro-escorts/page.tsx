import Image from "next/image";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import RegistroSubmit from "./registro-submit";
import GenderToggle from "./gender-toggle";
import LocationMapField from "./location-map-field";
import ProfileLoader from "./profile-loader";
import ServicesMultiSelect from "./services-multi-select";
import NationalitySelect from "./nationality-select";
import DescriptionHelper from "./description-helper";
import ContactPreferences from "./contact-preferences";
import SubscriptionSelector from "./subscription-selector";
import LaunchOfferPopup from "./launch-offer-popup";
import Navbar from "../../components/Navbar";

const steps = [
  {
    number: "1",
    title: "Stage name, contacts, and description",
    note: "Select gender, add your display name, contact channels, and a short bio.",
    fields: [
      "Stage name",
      "Advertiser email (not public)",
      "Password",
      "Phone number",
      "WhatsApp / Telegram",
      "Your age for your ad",
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
    note: "Add your service address if you want. You can also leave this step empty.",
    fields: ["Address"],
  },
  {
    number: "6",
    title: "Ad type and payment",
    note: "Choose subscription, payment method, and highlight any special offer.",
    fields: ["Subscription", "Payment method", "Offer icons", "Special offer"],
  },
];

const nationalityOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cabo Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Republic of the)",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic People's Republic of Korea",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia (Federated States of)",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
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
  "Young women. Escorts in Barcelona",
  "Mulatto",
  "Natural",
  "Black",
  "Mature companion in Barcelona",
  "Outstanding. Big-bootied escorts in Barcelona",
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
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Russian",
  "Arabic",
  "Hindi",
  "Bengali",
  "Urdu",
  "Punjabi",
  "Javanese",
  "Korean",
  "Japanese",
  "Vietnamese",
  "Turkish",
  "Thai",
  "Polish",
  "Dutch",
  "Greek",
  "Czech",
  "Slovak",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Serbian",
  "Croatian",
  "Ukrainian",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Hebrew",
  "Persian",
  "Malay",
  "Indonesian",
  "Filipino",
  "Swahili",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Zulu",
  "Afrikaans",
  "Amharic",
  "Somali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Sinhala",
  "Nepali",
  "Burmese",
  "Khmer",
  "Lao",
  "Mongolian",
  "Kazakh",
  "Uzbek",
  "Azerbaijani",
  "Georgian",
  "Armenian",
  "Lithuanian",
  "Latvian",
  "Estonian",
  "Icelandic",
  "Irish",
  "Welsh",
];

const specialFilterOptions = [
  "Available now in Barcelona",
  "Show your face",
  "To meet without commitment",
  "Sexcam",
  "Video call",
];

const paymentMethodOptions = [
  "Payment in cash (we will pass by to collect)",
  "Payment by ATM or bank transfer",
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

const buildRateOptions = (minutes: number, start: number, end: number) =>
  Array.from(
    { length: (end - start) / 10 + 1 },
    (_, index) => `${minutes} min. / €${start + index * 10}`
  );

const rate45Options = buildRateOptions(45, 30, 300);
const rate60Options = buildRateOptions(60, 50, 400);

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
  ...Array.from({ length: 24 }, (_, hour) =>
    `${hour.toString().padStart(2, "0")}:00`,
  ),
];

export default async function RegistroEscortsPage() {
  const session = await getAppServerSession();
  let initialGender: "girl" | "trans" = "girl";
  let initialName = "";
  let initialAge: number | null = null;
  let initialLocation = "";
  let initialImages: string[] = [];

  if (session?.user?.id) {
    const db = await getDb();
    const userId = new ObjectId(session.user.id);
    const [girlsAd, transAd] = await Promise.all([
      db.collection("girls").findOne({ userId, isDeleted: { $ne: true } }),
      db.collection("trans").findOne({ userId, isDeleted: { $ne: true } }),
    ]);

    const ad = girlsAd ?? transAd;
    if (ad) {
      initialGender =
        ad.gender === "trans" || ad.gender === "girl"
          ? ad.gender
          : girlsAd
            ? "girl"
            : "trans";
      initialName = typeof ad.name === "string" ? ad.name : "";
      initialAge = typeof ad.age === "number" ? ad.age : null;
      initialLocation = typeof ad.location === "string" ? ad.location : "";
      initialImages = Array.isArray(ad.images)
        ? ad.images.filter((item: unknown) => typeof item === "string")
        : [];
    }
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <LaunchOfferPopup />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.2),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <Navbar />
        <section className="mx-auto -mt-4 grid w-full max-w-6xl gap-8 px-4 pb-10 pt-2 sm:-mt-8 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-3 lg:-mt-10 lg:grid-cols-[1.05fr_0.95fr] xl:-mt-12">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
              Registration Studio
            </p>
              <h1
                className="max-w-[12ch] text-2xl font-semibold leading-tight sm:max-w-none sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
              Advertise in just 6 steps
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Create a premium profile, manage your ad, and reach your audience
              with a modern, secure workflow.
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/"
                className="inline-flex justify-center rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:text-white sm:px-6 sm:py-3 sm:text-xs sm:tracking-[0.35em]"
              >
                Go to main page
              </Link>
              <button className="inline-flex justify-center rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110 sm:px-6 sm:py-3 sm:text-xs sm:tracking-[0.35em]">
                Start Registration
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 sm:gap-4">
              {[
                { label: "On/Off", icon: "⚡" },
                { label: "Modify", icon: "✏️" },
                { label: "Update", icon: "🖼️" },
                { label: "Recharge", icon: "🔋" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[124px] flex-col items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-center text-white/70 sm:min-h-[140px] sm:px-5 sm:py-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center text-2xl sm:h-12 sm:w-12">
                    {item.icon}
                  </div>
                  <div className="max-w-full text-xs font-medium leading-snug uppercase tracking-[0.18em] [overflow-wrap:anywhere] sm:text-sm sm:tracking-[0.22em]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[240px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] sm:min-h-[360px]">
            <Image
                src="/images/Frau in Body.jpg"
                alt="Registration"
                fill
                priority
                loading="eager"
                fetchPriority="high"
                sizes="100vw"
                quality={70}
                className="object-cover"
              />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,11,13,0.65),rgba(10,11,13,0)_55%)]" />
          </div>
        </section>

        <form id="registro-escorts-form">
          <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
            <ProfileLoader />
          </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="rounded-[26px] border border-[#f5d68c]/40 bg-gradient-to-br from-[#f5d68c]/25 via-[#f5b35c]/10 to-[#0c0d10] p-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-[#f5d68c]/40 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.35em]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5d68c]/40 bg-black/60 text-sm">
                !
              </span>
              Important
            </div>
            <p className="mt-4 text-base font-semibold text-white/90 sm:text-lg">
              Only original content is allowed.
            </p>
            <p className="mt-2 text-base text-white/70 sm:text-lg">
              Duplicate or reused text may reduce profile visibility and damage credibility.
            </p>
            <p className="mt-2 text-base text-white/70 sm:text-lg">
              We reserve the right to edit or remove any content that does not meet originality standards. Protect your profile — use unique content only.
            </p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10">
          <div className="rounded-[28px] border border-white/10 bg-[#0c0d10] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-10">
            <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold sm:text-4xl">
                  Step 1 — Start your profile
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#f5d68c]/25 bg-[#f5d68c]/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f5d68c]">
                    Premium Setup
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                    Editable Later
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                    Profile Safe
                  </span>
                </div>
                <p className="max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
                  Everything in this step is saved with your advertiser profile. Contact channels only appear when you enable them, and optional fields can stay empty without causing any publish issue.
                </p>
                <GenderToggle initialGender={initialGender} />
                <div className="grid gap-3">
                  <input
                    name="stageName"
                    placeholder="Name you use to publish"
                    defaultValue={initialName}
                    className="w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Advertiser email (not public)"
                    className="w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="phone"
                    placeholder="Phone number for your ad"
                    className="w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                  <input
                    name="age"
                    type="number"
                    min={18}
                    max={80}
                    placeholder="Your age for your ad"
                    defaultValue={initialAge ?? ""}
                    className="w-full rounded-[22px] border border-white/10 bg-black/50 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.07),rgba(10,11,13,0.96)_48%)] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.4)] sm:p-5">
                <div className="relative min-h-[240px] overflow-hidden rounded-[24px] border border-white/10 sm:min-h-[360px]">
                  <Image
                      src="/images/hot10.webp"
                      alt="Registration preview"
                      fill
                      sizes="(max-width: 1024px) 88vw, 24vw"
                      className="object-cover"
                    />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.18),rgba(10,11,13,0.82))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="max-w-sm rounded-[24px] border border-white/10 bg-black/45 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5d68c]">
                        Profile Visibility
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        Save once. Show only what you want.
                      </p>
                      <p className="mt-2 text-base leading-relaxed text-white/68">
                        Contact links and profile text stay connected and can be edited later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Contact Control",
                      copy: "Only enabled channels appear publicly.",
                    },
                    {
                      title: "Profile Save",
                      copy: "Form data saves to your profile automatically.",
                    },
                    {
                      title: "Contact Safe",
                      copy: "Only the contact methods you enable appear publicly.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-white/10 bg-black/30 p-5"
                    >
                      <p className="text-base font-semibold uppercase tracking-[0.18em] text-white/82">
                        {item.title}
                      </p>
                      <p className="mt-2.5 text-base leading-relaxed text-white/58">
                        {item.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <DescriptionHelper />
                <ContactPreferences />
              </div>
            </div>
          </div>
        </section>

        

          <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
            <div className="grid gap-6">
              {steps.slice(1).map((step) => (
              <div key={step.number} className="contents">
                <div
                  className={`rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] ${
                    step.number === "5" ? "p-2 sm:p-3" : "p-3 sm:p-8"
                  }`}
                >
                  <div
                    className={`flex flex-col items-start ${
                      step.number === "5" ? "gap-2" : "gap-4 sm:gap-6"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-lg font-semibold sm:h-14 sm:w-14 sm:text-xl">
                      {step.number}
                    </div>
                    <div className="w-full flex-1 space-y-3 min-w-0">
                      <h3 className="text-lg font-semibold sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="text-base leading-relaxed text-white/65">{step.note}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {step.fields.map((field) => {
                        if (step.number === "3" && field === "Rate 20 min") {
                          return (
                            <select
                              key={field}
                              name="rate20"
                              defaultValue=""
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="">
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
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="">
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
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="">
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
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              <option value="">
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
                            <NationalitySelect
                              key={field}
                              name="nationality"
                              options={nationalityOptions}
                              label="Nationality"
                            />
                          );
                        }

                        if (step.number === "2" && field === "Services offered") {
                          return (
                            <ServicesMultiSelect
                              key={field}
                              name="servicesOffered"
                              options={serviceOptions}
                              label="Selected services"
                            />
                          );
                        }

                        if (
                          step.number === "2" &&
                          field === "Physical attributes"
                        ) {
                          return (
                            <ServicesMultiSelect
                              key={field}
                              name="physicalAttributes"
                              options={attributeOptions}
                              label="Selected attributes"
                            />
                          );
                        }

                        if (step.number === "2" && field === "Attention level") {
                          return (
                            <ServicesMultiSelect
                              key={field}
                              name="attentionLevel"
                              options={attentionOptions}
                              label="Selected attention"
                            />
                          );
                        }

                        if (step.number === "2" && field === "Languages") {
                          return (
                            <ServicesMultiSelect
                              key={field}
                              name="languages"
                              options={languageOptions}
                              label="Selected languages"
                            />
                          );
                        }

                        if (step.number === "2" && field === "Special Filters") {
                          return (
                            <ServicesMultiSelect
                              key={field}
                              name="specialFilters"
                              options={specialFilterOptions}
                              label="Selected filters"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Stage name") {
                          return (
                            <input
                              key={field}
                              name="stageName"
                              placeholder={field}
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Advertiser email (not public)") {
                          return (
                            <input
                              key={field}
                              name="email"
                              type="email"
                              placeholder={field}
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
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
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Phone number") {
                          return (
                            <input
                              key={field}
                              name="phone"
                              placeholder={field}
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "1" && field === "Your age for your ad") {
                          return (
                            <input
                              key={field}
                              name="age"
                              type="number"
                              min={18}
                              max={80}
                              placeholder={field}
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "5" && field === "Address") {
                          return (
                            <div key={field} className="md:col-span-2">
                              <LocationMapField
                                initialValue={initialLocation}
                              />
                            </div>
                          );
                        }

                        if (step.number === "5" && field === "Map confirmation") {
                          return (
                            <input
                              key={field}
                              name="mapConfirmation"
                              placeholder="Advertiser email (not public)"
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        if (step.number === "6" && field === "Subscription") {
                          return (
                            <SubscriptionSelector
                              key={field}
                              planName="subscriptionPlan"
                              durationName="subscriptionDuration"
                            />
                          );
                        }

                        if (step.number === "6" && field === "Payment method") {
                          return (
                              <div key={field} className="space-y-3">
                              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
                                  <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
                                    Payment type
                                  </div>
                                  <span className="rounded-full border border-[#f5d68c]/20 bg-[#f5d68c]/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f5d68c]/80">
                                    Choose one
                                  </span>
                                </div>
                              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-black/35 to-black/60 p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:p-4">
                              <div className="grid gap-2.5 sm:gap-3">
                                {paymentMethodOptions.map((option) => (
                                  <label key={option} className="block cursor-pointer">
                                    <input
                                      type="radio"
                                      name="paymentMethod"
                                      value={option}
                                      className="peer sr-only"
                                    />
                                    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/35 px-4 py-3 text-base text-white/84 transition hover:border-[#f5d68c]/35 peer-focus-visible:border-[#f5d68c]/55 peer-checked:border-[#f5d68c]/55 peer-checked:bg-gradient-to-r peer-checked:from-[#f5d68c]/12 peer-checked:via-[#f5b35c]/8 peer-checked:to-transparent sm:py-3.5">
                                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-[#f5d68c] transition peer-checked:border-[#f5d68c]/35 peer-checked:bg-[#f5d68c]/10 sm:h-12 sm:w-12">
                                        {option.toLowerCase().includes("cash") ? (
                                          <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            aria-hidden="true"
                                          >
                                            <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" />
                                            <path d="M8 12h8" />
                                            <circle cx="12" cy="12" r="2.3" />
                                          </svg>
                                        ) : (
                                          <svg
                                            viewBox="0 0 24 24"
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            aria-hidden="true"
                                          >
                                            <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
                                            <path d="M6 11v5.5c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5V11" />
                                          </svg>
                                        )}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-base font-medium leading-tight text-white/92">
                                          {option.toLowerCase().includes("cash")
                                            ? "Cash Collection"
                                            : "ATM / Bank Transfer"}
                                        </span>
                                        <span className="mt-1.5 block text-base leading-relaxed text-white/58">
                                          {option}
                                        </span>
                                      </span>
                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 text-transparent transition peer-checked:border-[#f5d68c]/50 peer-checked:bg-[#f5d68c]/15 peer-checked:text-[#f5d68c]">
                                        <svg
                                          viewBox="0 0 20 20"
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2.2"
                                          aria-hidden="true"
                                        >
                                          <path d="m4 10 4 4 8-10" />
                                        </svg>
                                      </span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                              </div>
                            </div>
                          );
                        }

                        if (step.number === "6" && field === "Offer icons") {
                          return (
                            <div key={field} className="sm:col-span-2 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
                                    Offer icons
                                  </div>
                                  <p className="mt-2 text-base leading-relaxed text-white/55">
                                    Fill either field only when you want its icon to appear on your public profile.
                                  </p>
                                </div>
                                <span className="rounded-full border border-[#f5d68c]/20 bg-[#f5d68c]/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f5d68c]/80">
                                  Optional
                                </span>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <label className="rounded-[26px] border border-emerald-300/20 bg-gradient-to-br from-emerald-400/12 via-black/35 to-black/65 p-4">
                                  <span className="flex items-center gap-3">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-emerald-100/80 bg-[#04c900] text-center text-xs font-bold uppercase leading-tight tracking-normal text-black shadow-[0_14px_30px_rgba(4,201,0,0.28)]">
                                      Active offer
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/78">
                                        Active offer
                                      </span>
                                      <span className="mt-1 block text-sm leading-relaxed text-white/48">
                                        Shown now on card and profile.
                                      </span>
                                    </span>
                                  </span>
                                  <textarea
                                    name="activeOffer"
                                    rows={3}
                                    placeholder="Example: Active today - 30 min special price"
                                    className="mt-4 w-full resize-none rounded-[22px] border border-white/10 bg-black/45 px-4 py-3 text-base text-white/88 placeholder:text-white/35 focus:border-emerald-300/60 focus:outline-none"
                                  />
                                </label>
                                <label className="rounded-[26px] border border-red-300/20 bg-gradient-to-br from-red-500/12 via-black/35 to-black/65 p-4">
                                  <span className="flex items-center gap-3">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-[#ff1616] text-center text-xs font-bold uppercase leading-tight tracking-normal text-black shadow-[0_14px_30px_rgba(255,22,22,0.28)]">
                                      Next offer
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-white/78">
                                        Next offer
                                      </span>
                                      <span className="mt-1 block text-sm leading-relaxed text-white/48">
                                        Shown only after this field is filled.
                                      </span>
                                    </span>
                                  </span>
                                  <textarea
                                    name="nextOffer"
                                    rows={3}
                                    placeholder="Example: Weekend new offer starts Friday"
                                    className="mt-4 w-full resize-none rounded-[22px] border border-white/10 bg-black/45 px-4 py-3 text-base text-white/88 placeholder:text-white/35 focus:border-red-300/60 focus:outline-none"
                                  />
                                </label>
                              </div>
                            </div>
                          );
                        }

                        if (step.number === "6" && field === "Special offer") {
                          return (
                            <div key={field} className="sm:col-span-2 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
                                  Special offer
                                </div>
                                <span className="rounded-full border border-[#f5d68c]/20 bg-[#f5d68c]/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f5d68c]/80">
                                  Optional
                                </span>
                              </div>
                              <textarea
                                name="specialOffer"
                                rows={4}
                                placeholder="Example: Happy hour before 18:00, 2x1 massage session, weekend discount, first visit special..."
                                className="w-full resize-none rounded-3xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white/88 placeholder:text-white/35 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                              <p className="text-base leading-relaxed text-white/55">
                                This text will be shown publicly on your profile as a highlighted advertiser offer.
                              </p>
                            </div>
                          );
                        }

                        if (step.number === "6" && field === "Featured banner") {
                          return (
                            <input
                              key={field}
                              name="featuredBanner"
                              placeholder={field}
                              className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                            />
                          );
                        }

                        return (
                          <input
                            key={field}
                            placeholder={field}
                            className="w-full rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 text-base text-white/88 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                          />
                        );
                      })}
                      </div>
                    </div>
                  </div>
                </div>
                {step.number === "3" ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-base font-semibold text-white sm:h-12 sm:w-12">
                          4
                        </div>
                        <h3 className="text-lg font-semibold sm:text-2xl">
                          Weekly schedule
                        </h3>
                      </div>
                      <p className="text-base leading-relaxed text-white/65">
                        Set your schedule by day. If you do not work on a day,
                        select it as Rest.
                      </p>
                      <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-3.5">
                        {scheduleDays.map((day) => (
                          <div
                            key={day}
                            className="grid items-center gap-3 rounded-[24px] border border-white/10 bg-black/25 p-4 sm:grid-cols-[128px_1fr_1fr] sm:gap-4 sm:bg-transparent sm:p-0 md:grid-cols-[160px_1fr_1fr_100px]"
                          >
                            <span className="text-base font-semibold text-white/88">{day}</span>
                            <select
                              defaultValue="Rest"
                              name={`schedule-${day}-start`}
                              className="w-full rounded-[22px] border border-white/10 bg-black/60 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
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
                              className="w-full rounded-[22px] border border-white/10 bg-black/60 px-4 py-3 text-base text-white/88 focus:border-[#f5d68c]/60 focus:outline-none"
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

          <RegistroSubmit initialImages={initialImages} />
        </form>
      </main>
    </div>
  );
}




