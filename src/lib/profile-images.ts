export type ImageApprovalStatus = "pending" | "approved" | "rejected";
export type ImageApprovals = Record<string, ImageApprovalStatus>;

export const normalizeImageApprovalStatus = (value: unknown): ImageApprovalStatus =>
  value === "approved" || value === "rejected" ? value : "pending";

export const normalizeImageApprovals = (value: unknown): ImageApprovals => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const approvals: ImageApprovals = {};
  for (const [url, status] of Object.entries(value as Record<string, unknown>)) {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) continue;
    approvals[trimmedUrl] = normalizeImageApprovalStatus(status);
  }
  return approvals;
};

export const readImageArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export const getPublicProfileImages = (
  imagesValue: unknown,
  approvalsValue: unknown
) => {
  const images = readImageArray(imagesValue);
  const approvals = normalizeImageApprovals(approvalsValue);
  return images.filter((image) => approvals[image] !== "rejected");
};
