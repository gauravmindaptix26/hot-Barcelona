"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ApprovalStatus = "pending" | "approved" | "rejected";
type PersistedFormFields = Record<string, string | string[]>;

type ProfileItem = {
  _id: string;
  name: string;
  age: number | null;
  location: string;
  email: string;
  gender: string;
  images: string[];
  formFields: PersistedFormFields;
  approvalStatus: ApprovalStatus;
  createdAt: string | null;
  createdAtLabel?: string;
};

type Props = {
  girls: ProfileItem[];
  trans: ProfileItem[];
};

type TabKey = "girls" | "trans";

type EditFormState = {
  name: string;
  age: string;
  location: string;
  email: string;
  gender: string;
  imagesText: string;
  formFields: PersistedFormFields;
};

const scheduleDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

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
] as const;

const knownFormFieldKeys = new Set([
  "stageName",
  "phone",
  "nationality",
  "descriptionText",
  "address",
  "mapConfirmation",
  "servicesOffered",
  "physicalAttributes",
  "attentionLevel",
  "specialFilters",
  "languages",
  "rate20",
  "rate30",
  "rate45",
  "rate60",
  "subscriptionPlan",
  "subscriptionDuration",
  "paymentMethod",
  "featuredBanner",
  ...scheduleDays.flatMap((day) => [`schedule-${day}-start`, `schedule-${day}-end`]),
]);

const fieldLabels: Record<string, string> = {
  stageName: "Stage Name",
  phone: "Phone Number",
  nationality: "Nationality",
  descriptionText: "Description",
  address: "Address",
  mapConfirmation: "Map Confirmation",
  servicesOffered: "Services Offered",
  physicalAttributes: "Physical Attributes",
  attentionLevel: "Attention Level",
  specialFilters: "Special Filters",
  languages: "Languages",
  rate20: "Rate 20 Min",
  rate30: "Rate 30 Min",
  rate45: "Rate 45 Min",
  rate60: "Rate 60 Min",
  subscriptionPlan: "Subscription Plan",
  subscriptionDuration: "Subscription Duration",
  paymentMethod: "Payment Method",
  featuredBanner: "Featured Banner",
};

const advertiseFieldChecklist = [
  {
    title: "Step 1",
    fields: [
      { key: "gender", label: "Gender", source: "core" as const },
      { key: "stageName", label: "Stage Name", source: "form" as const },
      { key: "email", label: "Email", source: "core" as const },
      { key: "password", label: "Password", source: "special" as const },
      { key: "phone", label: "Phone Number", source: "form" as const },
      { key: "age", label: "Age", source: "core" as const },
    ],
  },
  {
    title: "Step 2",
    fields: [
      { key: "nationality", label: "Nationality", source: "form" as const },
      { key: "servicesOffered", label: "Services Offered", source: "form" as const },
      { key: "physicalAttributes", label: "Physical Attributes", source: "form" as const },
      { key: "attentionLevel", label: "Attention Level", source: "form" as const },
      { key: "specialFilters", label: "Special Filters", source: "form" as const },
      { key: "languages", label: "Languages", source: "form" as const },
    ],
  },
  {
    title: "Step 3",
    fields: [
      { key: "rate20", label: "Rate 20", source: "form" as const },
      { key: "rate30", label: "Rate 30", source: "form" as const },
      { key: "rate45", label: "Rate 45", source: "form" as const },
      { key: "rate60", label: "Rate 60", source: "form" as const },
    ],
  },
  {
    title: "Step 4",
    fields: scheduleDays.flatMap((day) => [
      { key: `schedule-${day}-start`, label: `${day} Start`, source: "form" as const },
      { key: `schedule-${day}-end`, label: `${day} End`, source: "form" as const },
    ]),
  },
  {
    title: "Step 5",
    fields: [
      { key: "address", label: "Address", source: "form" as const },
      { key: "mapConfirmation", label: "Map Confirmation", source: "form" as const },
    ],
  },
  {
    title: "Step 6",
    fields: [
      { key: "subscriptionPlan", label: "Subscription Plan", source: "form" as const },
      { key: "subscriptionDuration", label: "Subscription Duration", source: "form" as const },
      { key: "paymentMethod", label: "Payment Method", source: "form" as const },
      { key: "featuredBanner", label: "Featured Banner", source: "form" as const },
    ],
  },
] as const;

const createEmptyEditForm = (): EditFormState => ({
  name: "",
  age: "",
  location: "",
  email: "",
  gender: "",
  imagesText: "",
  formFields: {},
});

const cloneFormFields = (formFields: PersistedFormFields): PersistedFormFields =>
  Object.fromEntries(
    Object.entries(formFields).map(([key, value]) => [
      key,
      Array.isArray(value) ? [...value] : value,
    ])
  );

const parseListInput = (value: string) =>
  Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const normalizeFormFields = (fields: PersistedFormFields): PersistedFormFields => {
  const next: PersistedFormFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      const normalized = Array.from(
        new Set(value.map((item) => item.trim()).filter(Boolean))
      );
      if (normalized.length > 0) {
        next[key] = normalized;
      }
      continue;
    }

    const normalized = value.trim();
    if (normalized) {
      next[key] = normalized;
    }
  }

  return next;
};

const readStringField = (fields: PersistedFormFields, key: string) => {
  const value = fields[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
};

const readArrayField = (fields: PersistedFormFields, key: string) => {
  const value = fields[key];
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const humanizeFieldKey = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const hasValue = (value: string | string[] | null | undefined) =>
  Array.isArray(value) ? value.length > 0 : typeof value === "string" ? value.trim().length > 0 : false;

const formSectionConfigs = [
  {
    id: "identity",
    title: "Identity & Contact",
    description: "Core profile identity fields shown in the ad workflow.",
    fields: [
      { key: "stageName", type: "text" as const },
      { key: "phone", type: "text" as const },
      { key: "nationality", type: "text" as const },
    ],
  },
  {
    id: "description",
    title: "Description & Location",
    description: "Profile copy and address fields.",
    fields: [
      { key: "descriptionText", type: "textarea" as const, rows: 4, fullWidth: true },
      { key: "address", type: "textarea" as const, rows: 3, fullWidth: true },
      { key: "mapConfirmation", type: "text" as const },
    ],
  },
  {
    id: "services",
    title: "Services & Filters",
    description: "Multi-value fields. Use one item per line or comma-separated.",
    fields: [
      { key: "servicesOffered", type: "list" as const, rows: 4 },
      { key: "physicalAttributes", type: "list" as const, rows: 4 },
      { key: "attentionLevel", type: "list" as const, rows: 4 },
      { key: "specialFilters", type: "list" as const, rows: 4 },
      { key: "languages", type: "list" as const, rows: 4 },
    ],
  },
  {
    id: "rates",
    title: "Rates & Plan",
    description: "Pricing, subscription, and payment fields.",
    fields: [
      { key: "rate20", type: "text" as const },
      { key: "rate30", type: "text" as const },
      { key: "rate45", type: "text" as const },
      { key: "rate60", type: "text" as const },
      { key: "subscriptionPlan", type: "text" as const },
      { key: "subscriptionDuration", type: "text" as const },
      { key: "paymentMethod", type: "textarea" as const, rows: 3 },
      { key: "featuredBanner", type: "text" as const },
    ],
  },
] as const;

export default function AdminClient({ girls, trans }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("girls");
  const [items, setItems] = useState<Record<TabKey, ProfileItem[]>>({
    girls,
    trans,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(createEmptyEditForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const activeItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rank: Record<ApprovalStatus, number> = {
      pending: 0,
      rejected: 1,
      approved: 2,
    };
    return items[activeTab]
      .filter((item) => {
        if (!term) return true;
        const hay = `${item.name} ${item.location}`.toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => {
        const rankDiff = rank[a.approvalStatus] - rank[b.approvalStatus];
        if (rankDiff !== 0) return rankDiff;
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [items, activeTab, search]);

  const summary = useMemo(() => {
    return activeItems.reduce(
      (acc, item) => {
        acc[item.approvalStatus] += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 } as Record<
        ApprovalStatus,
        number
      >
    );
  }, [activeItems]);

  const otherFieldEntries = useMemo(
    () =>
      Object.entries(editForm.formFields)
        .filter(([key]) => !knownFormFieldKeys.has(key))
        .sort(([a], [b]) => a.localeCompare(b)),
    [editForm.formFields]
  );

  const checklistStatus = useMemo(() => {
    return advertiseFieldChecklist.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.source === "special") {
          return {
            ...field,
            filled: true,
            note: "Stored securely as hash",
          };
        }

        const value =
          field.source === "core"
            ? field.key === "gender"
              ? editForm.gender
              : field.key === "email"
                ? editForm.email
                : field.key === "age"
                  ? editForm.age
                  : ""
            : editForm.formFields[field.key];

        return {
          ...field,
          filled: hasValue(value),
          note: hasValue(value) ? "Filled" : "Empty",
        };
      }),
    }));
  }, [editForm.email, editForm.formFields, editForm.age, editForm.gender]);

  const updateFormField = (key: string, value: string | string[]) => {
    setEditForm((prev) => {
      const nextFormFields = { ...prev.formFields };

      if (Array.isArray(value)) {
        const normalized = Array.from(
          new Set(value.map((item) => item.trim()).filter(Boolean))
        );
        if (normalized.length > 0) {
          nextFormFields[key] = normalized;
        } else {
          delete nextFormFields[key];
        }
      } else {
        const normalized = value.trim();
        if (normalized) {
          nextFormFields[key] = normalized;
        } else {
          delete nextFormFields[key];
        }
      }

      return {
        ...prev,
        formFields: nextFormFields,
      };
    });
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this profile?");
    if (!ok) return;
    setIsDeleting(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/profiles/${id}?type=${activeTab}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to delete profile.");
        return;
      }
      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((item) => item._id !== id),
      }));
    } catch {
      setError("Failed to delete profile.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleApproval = async (id: string, action: "accept" | "reject") => {
    setIsUpdatingStatus(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/profiles/${id}?type=${activeTab}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to update profile status.");
        return;
      }

      const data = (await response.json()) as { approvalStatus?: ApprovalStatus };
      const nextStatus: ApprovalStatus =
        data.approvalStatus === "pending" ||
        data.approvalStatus === "approved" ||
        data.approvalStatus === "rejected"
          ? data.approvalStatus
          : action === "accept"
            ? "approved"
            : "rejected";

      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item) =>
          item._id === id ? { ...item, approvalStatus: nextStatus } : item
        ),
      }));
    } catch {
      setError("Failed to update profile status.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const startEdit = (item: ProfileItem) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      age: item.age !== null && Number.isFinite(item.age) ? String(item.age) : "",
      location: item.location,
      email: item.email,
      gender: item.gender,
      imagesText: item.images.join("\n"),
      formFields: cloneFormFields(item.formFields ?? {}),
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsSavingEdit(false);
    setEditForm(createEmptyEditForm());
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const age = Number(editForm.age);
    const images = editForm.imagesText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    const normalizedFormFields = normalizeFormFields(editForm.formFields);

    if (!editForm.name.trim() || !editForm.location.trim() || !Number.isFinite(age)) {
      setError("Name, age, and location are required.");
      return;
    }
    if (images.length < 1) {
      setError("At least 1 image URL is required.");
      return;
    }

    setIsSavingEdit(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/profiles/${editingId}?type=${activeTab}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name.trim(),
            age,
            location: editForm.location.trim(),
            email: editForm.email.trim().toLowerCase(),
            gender: editForm.gender.trim().toLowerCase(),
            images,
            formFields: normalizedFormFields,
          }),
        }
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to update profile.");
        return;
      }

      const data = (await response.json()) as {
        profile?: {
          _id?: string;
          name?: string;
          age?: number | null;
          location?: string;
          email?: string;
          gender?: string;
          images?: string[];
          formFields?: PersistedFormFields;
        };
      };

      const updated = data.profile;
      if (!updated?._id) {
        setError("Failed to update profile.");
        return;
      }

      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item) =>
          item._id === updated._id
            ? {
                ...item,
                name: typeof updated.name === "string" ? updated.name : item.name,
                age: typeof updated.age === "number" ? updated.age : item.age,
                location:
                  typeof updated.location === "string"
                    ? updated.location
                    : item.location,
                email:
                  typeof updated.email === "string" ? updated.email : item.email,
                gender:
                  typeof updated.gender === "string" ? updated.gender : item.gender,
                images: Array.isArray(updated.images) ? updated.images : item.images,
                formFields:
                  updated.formFields && typeof updated.formFields === "object"
                    ? updated.formFields
                    : item.formFields,
              }
            : item
        ),
      }));
      setEditingId(null);
      setEditForm(createEmptyEditForm());
    } catch {
      setError("Failed to update profile.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const statusLabel = (status: ApprovalStatus) =>
    status === "pending"
      ? "Pending"
      : status === "approved"
        ? "Approved"
        : "Rejected";

  const statusClass = (status: ApprovalStatus) =>
    status === "pending"
      ? "border-amber-300/30 bg-amber-500/10 text-amber-200"
      : status === "approved"
        ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
        : "border-rose-300/30 bg-rose-500/10 text-rose-200";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
            Admin Console
          </p>
          <h1
            className="mt-3 text-2xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Manage profiles
          </h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1 text-[10px] uppercase tracking-[0.18em] text-white/70 sm:w-auto sm:gap-3 sm:text-xs sm:tracking-[0.3em]">
            {(["girls", "trans"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 rounded-full px-4 py-2 transition sm:flex-none sm:px-5 ${
                  activeTab === key
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or location"
            className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-white/40">
            Search
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/50 sm:text-xs sm:tracking-[0.3em]">
          {activeItems.length} results
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/60 sm:tracking-[0.25em]">
        <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-amber-200">
          Pending: {summary.pending}
        </span>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
          Approved: {summary.approved}
        </span>
        <span className="rounded-full border border-rose-300/30 bg-rose-500/10 px-3 py-1 text-rose-200">
          Rejected: {summary.rejected}
        </span>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {activeItems.map((item) => (
          <div
            key={item._id}
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0c0d10] shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
          >
            <div className="relative h-64 w-full overflow-hidden">
              {item.images[0] ? (
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,214,140,0.2),_rgba(10,11,13,0.9))] text-xs uppercase tracking-[0.4em] text-white/60">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_40%,rgba(10,11,13,0.85)_100%)]" />
            </div>

            <div className="space-y-3 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold">{item.name}</h2>
                  <p className="break-words text-sm text-white/60">
                    {item.age ?? "-"} - {item.location || "Unknown location"}
                  </p>
                  {item.email && (
                    <p className="mt-1 break-all text-xs text-white/45">{item.email}</p>
                  )}
                </div>
                <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60 sm:tracking-[0.25em]">
                  {activeTab}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.28em] ${statusClass(
                    item.approvalStatus
                  )}`}
                >
                  {statusLabel(item.approvalStatus)}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs text-white/50 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <span>{item.createdAtLabel ?? "No date"}</span>
                <span className="break-words">
                  {item.images.length} photos / {Object.keys(item.formFields ?? {}).length} fields
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  disabled={
                    isDeleting === item._id ||
                    isUpdatingStatus === item._id ||
                    isSavingEdit
                  }
                  className="rounded-full border border-sky-300/30 bg-sky-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleApproval(item._id, "accept")}
                  disabled={
                    isUpdatingStatus === item._id ||
                    item.approvalStatus === "approved" ||
                    isSavingEdit
                  }
                  className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
                >
                  {isUpdatingStatus === item._id ? "Saving..." : "Accept"}
                </button>
                <button
                  type="button"
                  onClick={() => handleApproval(item._id, "reject")}
                  disabled={
                    isUpdatingStatus === item._id ||
                    item.approvalStatus === "rejected" ||
                    isSavingEdit
                  }
                  className="rounded-full border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
                >
                  {isUpdatingStatus === item._id ? "Saving..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  disabled={
                    isDeleting === item._id ||
                    isUpdatingStatus === item._id ||
                    isSavingEdit
                  }
                  className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-xs sm:tracking-[0.3em]"
                >
                  {isDeleting === item._id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {editingId === item._id && (
                <div className="mt-5 space-y-5 rounded-[24px] border border-[#f5d68c]/20 bg-[linear-gradient(145deg,rgba(245,214,140,0.08),rgba(10,11,13,0.92)_40%)] p-4 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-xs">
                        Structured Edit
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Admin profile editor
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                      {Object.keys(editForm.formFields).length} form fields
                    </span>
                  </div>

                  <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                        Core Profile
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        Main document fields used by listings and public cards.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <label className="space-y-2 xl:col-span-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                          Display Name
                        </span>
                        <input
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Name"
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                          Age
                        </span>
                        <input
                          type="number"
                          min={18}
                          max={80}
                          value={editForm.age}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, age: event.target.value }))
                          }
                          placeholder="Age"
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                        />
                      </label>
                      <label className="space-y-2 xl:col-span-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                          Location
                        </span>
                        <input
                          value={editForm.location}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, location: event.target.value }))
                          }
                          placeholder="Location"
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                        />
                      </label>
                      <label className="space-y-2 xl:col-span-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                          Email
                        </span>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, email: event.target.value }))
                          }
                          placeholder="Email"
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                          Gender
                        </span>
                        <select
                          value={editForm.gender}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, gender: event.target.value }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                        >
                          <option value="">Select gender</option>
                          <option value="girl">girl</option>
                          <option value="trans">trans</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                        Advertise Checklist
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        Same workflow fields as the advertise form. Admin can quickly verify what is present.
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {checklistStatus.map((section) => (
                        <div
                          key={section.title}
                          className="rounded-2xl border border-white/10 bg-black/35 p-4"
                        >
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/65">
                            {section.title}
                          </p>
                          <div className="mt-3 grid gap-2">
                            {section.fields.map((field) => (
                              <div
                                key={field.key}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/35 px-3 py-2"
                              >
                                <span className="text-sm text-white/80">{field.label}</span>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
                                    field.filled
                                      ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
                                      : "border border-amber-300/30 bg-amber-500/10 text-amber-200"
                                  }`}
                                >
                                  {field.note}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                        Images
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        Keep one image URL per line. Minimum one image is required.
                      </p>
                    </div>
                    <textarea
                      value={editForm.imagesText}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          imagesText: event.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                    />
                  </section>

                  {formSectionConfigs.map((section) => (
                    <section
                      key={section.id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                          {section.title}
                        </p>
                        <p className="mt-1 text-sm text-white/55">{section.description}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.fields.map((field) => (
                          <label
                            key={field.key}
                            className={`space-y-2 ${"fullWidth" in field && field.fullWidth ? "sm:col-span-2" : ""}`}
                          >
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                              {fieldLabels[field.key] ?? humanizeFieldKey(field.key)}
                            </span>

                            {field.type === "textarea" ? (
                              <textarea
                                value={readStringField(editForm.formFields, field.key)}
                                onChange={(event) =>
                                  updateFormField(field.key, event.target.value)
                                }
                                rows={field.rows ?? 3}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                            ) : field.type === "list" ? (
                              <textarea
                                value={readArrayField(editForm.formFields, field.key).join("\n")}
                                onChange={(event) =>
                                  updateFormField(field.key, parseListInput(event.target.value))
                                }
                                rows={field.rows ?? 4}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                            ) : (
                              <input
                                value={readStringField(editForm.formFields, field.key)}
                                onChange={(event) =>
                                  updateFormField(field.key, event.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}

                  <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                        Weekly Schedule
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        Start and end time for each day. Use Rest when unavailable.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {scheduleDays.map((day) => (
                        <div
                          key={day}
                          className="grid gap-3 rounded-2xl border border-white/10 bg-black/35 p-3 md:grid-cols-[140px_1fr_1fr]"
                        >
                          <div className="flex items-center text-sm font-medium text-white/80">
                            {day}
                          </div>
                          <label className="space-y-2">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                              Start
                            </span>
                            <select
                              value={
                                readStringField(editForm.formFields, `schedule-${day}-start`) ||
                                "Rest"
                              }
                              onChange={(event) =>
                                updateFormField(`schedule-${day}-start`, event.target.value)
                              }
                              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              {scheduleOptions.map((option) => (
                                <option key={`${day}-start-${option}`} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                              End
                            </span>
                            <select
                              value={
                                readStringField(editForm.formFields, `schedule-${day}-end`) ||
                                "Rest"
                              }
                              onChange={(event) =>
                                updateFormField(`schedule-${day}-end`, event.target.value)
                              }
                              className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                            >
                              {scheduleOptions.map((option) => (
                                <option key={`${day}-end-${option}`} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      ))}
                    </div>
                  </section>

                  {otherFieldEntries.length > 0 && (
                    <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs">
                          Other Fields
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          Extra saved keys that are not part of the main structured layout.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {otherFieldEntries.map(([key, value]) => (
                          <label key={key} className="space-y-2">
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">
                              {humanizeFieldKey(key)}
                            </span>
                            {Array.isArray(value) ? (
                              <textarea
                                value={value.join("\n")}
                                onChange={(event) =>
                                  updateFormField(key, parseListInput(event.target.value))
                                }
                                rows={4}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                            ) : (
                              <input
                                value={value}
                                onChange={(event) => updateFormField(key, event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit}
                      className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingEdit ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSavingEdit}
                      className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeItems.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-white/60">
          No profiles found in this category.
        </div>
      )}
    </div>
  );
}
