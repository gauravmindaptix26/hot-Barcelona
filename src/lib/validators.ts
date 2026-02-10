import { z } from "zod";

export const genderSchema = z.enum(["female", "male"]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: genderSchema,
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  age: z.coerce.number().min(18, "Age must be 18+").max(80),
  location: z.string().trim().min(2, "Location is required"),
  bio: z.string().trim().min(20, "Bio must be at least 20 characters").max(600),
  interests: z
    .string()
    .trim()
    .min(2, "Interests are required"),
  images: z
    .array(
      z.string().refine(
        (value) => value.startsWith("http") || value.startsWith("/uploads/"),
        "Invalid image URL"
      )
    )
    .min(3)
    .max(4),
});
