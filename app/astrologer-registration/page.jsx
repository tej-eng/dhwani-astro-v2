"use client";

import { useState } from "react";
import { CREATE_APPLICATION } from "../graphql/gqlQuery";
import { useMutation } from "@apollo/client/react";

export default function AstrologerRegistration() {
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    languages: [],
    skills: [],
    experience: "",
    email: "",
    phone: "",
    about: "",
    address: "",
    pincode: "",
  });

  const [createApplication, { loading, error }] =
    useMutation(CREATE_APPLICATION);

  // ------------------ handlers ------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (field, value) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.dob) newErrors.dob = "DOB is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (form.languages.length === 0) newErrors.languages = "Select at least one language";
    if (form.skills.length === 0) newErrors.skills = "Select at least one skill";
    if (!form.experience) newErrors.experience = "Experience required";
    if (!form.phone) newErrors.phone = "Phone required";
    if (!form.address) newErrors.address = "Address required";

    // Optional: strict validation
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

    if (Object.keys(newErrors).length > 0) {
      const first = Object.keys(newErrors)[0];
      document.querySelector(`[name="${first}"]`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createApplication({
        variables: {
          input: {
            name: form.name,
            phoneNumber: form.phone,
            dob: new Date(form.dob).toISOString(),
            gender: form.gender,
            languages: form.languages,
            skills: form.skills,
            experience: Number(form.experience),
            about: form.about,
            address: form.address,

            ...(form.email && { email: form.email }),
            ...(form.pincode && { pincode: form.pincode }),
          }
        },
      });

      alert("Application Submitted 🚀");

      setForm({
        name: "",
        dob: "",
        gender: "",
        languages: [],
        skills: [],
        experience: "",
        email: "",
        phone: "",
        about: "",
        address: "",
        pincode: "",
      });

      setErrors({});
      setPreview(null);
    } catch (err) {
      alert(err.message || "Submission failed");
    }
  };

  // ------------------ UI ------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Astrologer Registration
        </h2>

        {/* Profile Upload */}
        <div className="flex flex-col items-center mb-6">
          <label className="cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">Upload</span>
              )}
            </div>
            <input type="file" className="hidden" required onChange={handleImage} />
          </label>
          <p className="text-xs mt-2 text-gray-500">
            Profile Pic (.jpg, .png)
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {/* Name + DOB */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name" required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date" required
              value={form.dob}
              onChange={handleChange}
              error={errors.dob}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-2 font-medium">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              {["MALE", "FEMALE", "OTHER"].map((g) => (
                <label key={g} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g} required
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-indigo-500"
                  />
                  {g}
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Languages */}
          <MultiSelect
            label="Languages"
            field="languages" required
            selected={form.languages}
            options={["English", "Hindi", "Gujarati", "Tamil", "Punjabi"]}
            handleCheckbox={handleCheckbox}
            error={errors.languages}
          />

          {/* Skills + Experience */}
          <div className="grid md:grid-cols-2 gap-4">
            <MultiSelect
              label="Skills"
              field="skills" required
              selected={form.skills}
              options={["Vedic", "Tarot", "Numerology", "Vastu"]}
              handleCheckbox={handleCheckbox}
              error={errors.skills}
            />

            <Input
              label="Experience (years)"
              name="experience"
              type="number" required value={form.experience}
              onChange={handleChange}
              error={errors.experience}
            />
          </div>

          {/* Email + Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel" required
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Address"
              name="address" required
              type="text"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
            <Input
              label="Pincode"
              name="pincode"
              type="tel"
              value={form.pincode}
              onChange={handleChange}
            />
          </div>

          {/* About */}
          <div>
            <label className="block mb-2 font-medium">About Yourself</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-400 outline-none"
              rows="4"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">
              {error.message || "Something went wrong"}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white transition ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Input Component */
function Input({ label, name, value, onChange, type = "text", error, required }) {
  return (
    <div>
      <label className="block mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full p-3 rounded-xl outline-none border ${error ? "border-red-500" : "border-gray-200"
          }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* MultiSelect */
function MultiSelect({
  label,
  options,
  field,
  selected,
  handleCheckbox,
  error,
  required 
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`grid grid-cols-2 gap-2 rounded-xl p-3 border ${error ? "border-red-500" : "border-gray-200"
          }`}
      >
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => handleCheckbox(field, opt)}
              className="accent-indigo-500"
            />
            {opt}
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}