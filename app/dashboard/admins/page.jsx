"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
  FaUserShield,
  FaUserPlus,
  FaTrashAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSyncAlt,
  FaTimes,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

/* =========================================
   SUPABASE
========================================= */

const supabase = createClient();

/* =========================================
   HELPERS
========================================= */

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  const message = error?.message || "";

  if (message.includes("No account found")) {
    return "এই Email দিয়ে Supabase Authentication-এ কোনো Account পাওয়া যায়নি।";
  }

  if (message.includes("already an admin")) {
    return "এই Account আগে থেকেই Admin।";
  }

  if (message.includes("cannot remove yourself")) {
    return "নিজের Admin Permission নিজে বাতিল করতে পারবেন না।";
  }

  if (message.includes("last admin")) {
    return "সর্বশেষ Admin-কে Remove করা যাবে না।";
  }

  if (message.includes("Access denied")) {
    return "আপনার Admin Permission নেই।";
  }

  return message || "কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}

/* =========================================
   MAIN PAGE
========================================= */

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmation, setConfirmation] = useState(null);

  /* =========================================
     LOAD ADMINS
  ========================================= */

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase.rpc(
        "admin_management_list",
      );

      if (fetchError) throw fetchError;

      setAdmins(data || []);
    } catch (err) {
      console.error("Load admins error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  /* =========================================
     REQUEST ADD ADMIN
  ========================================= */

  function handleAddRequest(event) {
    event.preventDefault();

    if (submitting) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Admin-এর Email লিখুন।");
      return;
    }

    setError("");
    setSuccess("");

    setConfirmation({
      type: "add",
      email: cleanEmail,
    });
  }

  /* =========================================
     REQUEST REMOVE ADMIN
  ========================================= */

  function handleRemoveRequest(admin) {
    if (submitting || admin.is_current_user) return;

    setError("");
    setSuccess("");

    setConfirmation({
      type: "remove",
      admin,
    });
  }

  /* =========================================
     CONFIRM ACTION
  ========================================= */

  async function confirmAction() {
    if (!confirmation || submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const action = confirmation;

    try {
      if (action.type === "add") {
        const { error: addError } = await supabase.rpc("admin_management_add", {
          p_email: action.email,
        });

        if (addError) throw addError;

        setSuccess(`${action.email} সফলভাবে Admin হিসেবে যুক্ত হয়েছে।`);

        setEmail("");
      } else {
        const { error: removeError } = await supabase.rpc(
          "admin_management_remove",
          {
            p_user_id: action.admin.user_id,
          },
        );

        if (removeError) throw removeError;

        setSuccess(
          `${action.admin.email} এর Admin Permission বাতিল করা হয়েছে।`,
        );
      }

      setConfirmation(null);

      await loadAdmins();
    } catch (err) {
      console.error("Admin management error:", err);

      setConfirmation(null);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <main className="mx-auto max-w-5xl space-y-5 pb-24">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-900 sm:text-2xl">
            <FaUserShield className="text-teal-700" />
            Admin Management
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            নতুন Admin যোগ করুন এবং Admin Permission পরিচালনা করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={loading || submitting}
          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-4 text-white">
          <FaUsers className="text-xl text-teal-200" />

          <p className="mt-3 text-xs text-teal-100">মোট Admin</p>

          <p className="mt-1 text-3xl font-black">
            {loading ? "..." : admins.length.toLocaleString("bn-BD")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <FaShieldAlt className="text-xl text-teal-700" />

          <p className="mt-3 text-xs text-slate-500">নিরাপত্তা</p>

          <p className="mt-2 text-sm font-black text-emerald-700">Admin Only</p>
        </div>
      </section>

      {/* MESSAGES */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold leading-6 text-emerald-700"
        >
          <FaCheckCircle className="mt-1 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-bold leading-6 text-red-700"
        >
          <FaExclamationTriangle className="mt-1 shrink-0" />
          {error}
        </div>
      )}

      {/* ADD ADMIN FORM */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
            <FaUserPlus className="text-teal-700" />
            নতুন Admin যোগ করুন
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            প্রথমে Supabase Authentication-এ Email ও Password দিয়ে User তৈরি
            করুন। তারপর এখানে Email লিখুন।
          </p>
        </div>

        <form onSubmit={handleAddRequest} className="space-y-4 p-4 sm:p-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-xs font-bold text-slate-700"
            >
              নতুন Admin-এর Email
            </label>

            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="newadmin@example.com"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={submitting}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaUserPlus />
            Admin যোগ করুন
          </button>
        </form>
      </section>

      {/* ADMIN LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <h2 className="text-base font-black text-slate-900">Admin তালিকা</h2>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {admins.length.toLocaleString("bn-BD")} জন
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <FaSpinner className="animate-spin text-teal-700" />
            তথ্য লোড হচ্ছে...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            কোনো Admin পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <div
                key={admin.user_id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <FaUserShield />
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm font-bold text-slate-900">
                      {admin.email}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      যুক্ত হয়েছেন: {formatDate(admin.created_at)}
                    </p>

                    {admin.is_current_user && (
                      <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        আপনার Account
                      </span>
                    )}
                  </div>
                </div>

                {!admin.is_current_user && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRequest(admin)}
                    disabled={submitting || admins.length <= 1}
                    className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaTrashAlt />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONFIRMATION MODAL */}
      {confirmation && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="admin-confirm-title"
                className="text-lg font-black text-slate-900"
              >
                {confirmation.type === "add"
                  ? "নতুন Admin যোগ করবেন?"
                  : "Admin Permission বাতিল করবেন?"}
              </h2>

              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={submitting}
                aria-label="বন্ধ করুন"
                className="grid size-9 cursor-pointer place-items-center rounded-xl bg-slate-100 text-slate-600 disabled:cursor-not-allowed"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Email</p>

              <p className="mt-1 break-all text-sm font-black text-slate-900">
                {confirmation.type === "add"
                  ? confirmation.email
                  : confirmation.admin.email}
              </p>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-600">
              {confirmation.type === "add"
                ? "নিশ্চিত করলে এই Account Admin Dashboard ব্যবহার করার অনুমতি পাবে।"
                : "নিশ্চিত করলে এই Account-এর Admin Permission বাতিল হবে। Email Account Delete হবে না।"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={submitting}
                className="min-h-12 cursor-pointer rounded-xl border border-slate-200 text-sm font-bold text-slate-700 disabled:cursor-not-allowed"
              >
                ফিরে যান
              </button>

              <button
                type="button"
                onClick={confirmAction}
                disabled={submitting}
                className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmation.type === "add"
                    ? "bg-teal-700 hover:bg-teal-800"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    অপেক্ষা করুন
                  </>
                ) : confirmation.type === "add" ? (
                  <>
                    <FaCheckCircle />
                    নিশ্চিত করুন
                  </>
                ) : (
                  <>
                    <FaTrashAlt />
                    Remove করুন
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
