"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import {
  FaArrowLeft,
  FaUser,
  FaPhoneAlt,
  FaBriefcase,
  FaUserPlus,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaIdCard,
  FaExclamationCircle,
} from "react-icons/fa";

const initialForm = {
  full_name: "",
  mobile: "",
  profession: "",
};

const banglaDigits = "০১২৩৪৫৬৭৮৯";

function normalizeDigits(value) {
  return value.replace(/[০-৯]/g, (digit) =>
    String(banglaDigits.indexOf(digit)),
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = "text",
  maxLength = 100,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </div>
    </div>
  );
}

export default function JoinPage() {
  const [form, setForm] = useState(initialForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "mobile" ? normalizeDigits(value).replace(/\D/g, "") : value,
    }));

    setError("");
  }

  function handleReview(event) {
    event.preventDefault();

    const cleaned = {
      full_name: form.full_name.trim(),
      mobile: form.mobile.trim(),
      profession: form.profession.trim(),
    };

    if (cleaned.full_name.length < 2 || cleaned.profession.length < 2) {
      setError("নাম ও পেশা সঠিকভাবে লিখুন।");
      return;
    }

    if (!/^01[0-9]{9}$/.test(cleaned.mobile)) {
      setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।");
      return;
    }

    setForm(cleaned);
    setError("");
    setConfirmOpen(true);
  }

  async function handleFinalSubmit() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: submitError } = await supabase.rpc(
        "register_member",
        {
          p_full_name: form.full_name,
          p_mobile: form.mobile,
          p_profession: form.profession,
        },
      );

      if (submitError) throw submitError;

      const result = data?.[0];

      if (!result?.new_member_id) {
        throw new Error("Member ID পাওয়া যায়নি");
      }

      setMember({
        id: result.new_member_id,
        name: result.new_full_name,
      });

      setConfirmOpen(false);
      setForm(initialForm);
    } catch (err) {
      console.error("Registration error:", err);
      setConfirmOpen(false);
      if (err?.code === "23505") {
        setError("এই মোবাইল নম্বর দিয়ে ইতোমধ্যে সদস্য নিবন্ধন করা হয়েছে।");
      } else {
        setError(
          err?.message || "সদস্য নিবন্ধন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function resetRegistration() {
    setMember(null);
    setForm({ ...initialForm });
    setConfirmOpen(false);
    setError("");
    setLoading(false);
  }

  /* SUCCESS SCREEN */
  if (member) {
    return (
      <main className="mx-auto flex min-h-[75dvh] max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-emerald-50">
          <FaCheckCircle className="text-4xl text-emerald-600" />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-900">অভিনন্দন!</h1>

        <p className="mt-2 text-sm leading-7 text-slate-600">
          <strong>{member.name}</strong>, আপনি নাথপাড়া যুবসংঘের সদস্য হয়েছেন।
        </p>

        <div className="mt-6 w-full rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white shadow-lg">
          <FaIdCard className="mx-auto text-3xl text-teal-200" />

          <p className="mt-4 text-xs text-teal-100">আপনার সদস্য ID</p>

          <p className="mt-3 font-mono text-5xl font-black tracking-[0.15em]">
            {member.id}
          </p>

          <p className="mt-3 text-xs text-teal-100">এই ID সংরক্ষণ করে রাখুন</p>
        </div>

        <button
          type="button"
          onClick={resetRegistration}
          className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800"
        >
          <FaUserPlus />
          নতুন সদস্য নিবন্ধন করুন
        </button>

        <Link
          href="/members"
          onClick={resetRegistration}
          className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-teal-700 text-sm font-bold text-white"
        >
          সদস্য তালিকা দেখুন
        </Link>

        <Link
          href="/"
          onClick={resetRegistration}
          className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
        >
          হোমপেজে ফিরে যান
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-3 py-4">
      {/* TITLE */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          aria-label="হোমপেজে ফিরে যান"
          className="grid size-10 cursor-pointer place-items-center rounded-xl bg-white text-slate-700 shadow-sm"
        >
          <FaArrowLeft />
        </Link>

        <div>
          <h1 className="text-lg font-black text-slate-900">সদস্য হোন</h1>

          <p className="text-[11px] text-slate-500">নতুন সদস্য নিবন্ধন</p>
        </div>
      </div>

      {/* INTRO */}
      <section className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-900 p-4 text-white">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
          <FaUserPlus className="text-xl" />
        </div>

        <div>
          <h2 className="text-sm font-extrabold">নাথপাড়া যুবসংঘে স্বাগতম</h2>

          <p className="mt-1 text-[11px] leading-5 text-teal-100">
            তিনটি তথ্য পূরণ করুন। নিবন্ধন শেষ হলেই সদস্য ID পেয়ে যাবেন।
          </p>
        </div>
      </section>

      {/* FORM */}
      <form
        onSubmit={handleReview}
        className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            ব্যক্তিগত তথ্য
          </h2>

          <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">
            সব Field Required
          </span>
        </div>

        <Field
          label="আপনার পুরো নাম"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          icon={FaUser}
          placeholder="Type your full name"
        />

        <Field
          label="মোবাইল নম্বর"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          icon={FaPhoneAlt}
          placeholder="01XXXXXXXXX"
          type="tel"
          maxLength={11}
        />

        <Field
          label="পেশা"
          name="profession"
          value={form.profession}
          onChange={handleChange}
          icon={FaBriefcase}
          placeholder="Example: Student, Businessman, Teacher"
        />

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700"
          >
            <FaExclamationCircle className="mt-1 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800 active:scale-[0.98]"
        >
          <FaUserPlus />
          সদস্য হোন
        </button>

        <p className="text-center text-[11px] leading-6 text-slate-500">
          Submit করার আগে তথ্য নিশ্চিত করতে পারবেন।
        </p>
      </form>

      {/* CONFIRMATION */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="confirm-title"
                className="text-lg font-black text-slate-900"
              >
                তথ্য নিশ্চিত করুন
              </h2>

              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                aria-label="বন্ধ করুন"
                className="grid size-9 cursor-pointer place-items-center rounded-xl bg-slate-100 text-slate-600 disabled:cursor-not-allowed"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              নিচের তথ্যগুলো সঠিক হলে নিশ্চিত করুন। নিশ্চিত করার সঙ্গে সঙ্গে
              সদস্য তৈরি হবে।
            </p>

            <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              {[
                ["নাম", form.full_name],
                ["মোবাইল", form.mobile],
                ["পেশা", form.profession],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="mt-1 break-words font-bold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
                className="min-h-12 cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 disabled:cursor-not-allowed"
              >
                সংশোধন করুন
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    অপেক্ষা করুন
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    নিশ্চিত করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
