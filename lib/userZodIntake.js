import { z } from "zod";

export const requestFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Only alphabets allowed"),

  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone too long"),

  countryCode: z.string().min(1, "Country code required"),

  usergender: z
    .string()
    .refine((val) => val !== "Select Gender" && val !== "", {
      message: "Please select gender",
    }),

  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => new Date(date) <= new Date(), {
      message: "DOB cannot be in future",
    }),

  time: z.string().min(1, "Birth time is required"),

  occupation: z.string().min(1, "Occupation required"),

  place: z.string().min(1, "Birth place is required"),

  latitude: z.number().nullable().optional(),

  longitude: z.number().nullable().optional(),
  source:z.string()
  
});