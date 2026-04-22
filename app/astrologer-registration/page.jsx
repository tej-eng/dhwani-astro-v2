"use client";

import { useState } from "react";
import { CREATE_APPLICATION } from "../graphql/gqlQuery";
import { useMutation } from "@apollo/client/react";

export default function AstrologerRegistration() {
  const [preview, setPreview] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createApplication({
        variables: {
          input: {
            name: form.name,
            phoneNumber: form.phone,
            email: form.email,
            dob: form.dob,
            gender: form.gender,
            languages: form.languages,
            skills: form.skills,
            experience: Number(form.experience),
            about: form.about,
          },
        },
      });

      alert("Application Submitted 🚀");

      // reset form
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
      });
      setPreview(null);
    } catch (err) {
      console.error(err);
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
            <input type="file" className="hidden" onChange={handleImage} />
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
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block mb-2 font-medium">Gender</label>
            <div className="flex gap-6">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-indigo-500"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <MultiSelect
            label="Languages"
            field="languages"
            selected={form.languages}
            options={["English", "Hindi", "Gujarati", "Tamil", "Punjabi"]}
            handleCheckbox={handleCheckbox}
          />

          {/* Skills + Experience */}
          <div className="grid md:grid-cols-2 gap-4">
            <MultiSelect
              label="Skills"
              field="skills"
              selected={form.skills}
              options={["Vedic", "Tarot", "Numerology", "Vastu"]}
              handleCheckbox={handleCheckbox}
            />

            <Input
              label="Experience (years)"
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
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
              type="tel"
              value={form.phone}
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
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
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
            className={`w-full py-3 rounded-xl text-white transition ${
              loading
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
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
      />
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
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <div className="grid grid-cols-2 gap-2 border p-3 rounded-xl">
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
    </div>
  );
}