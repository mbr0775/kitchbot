"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const ADMIN_EMAIL = "mubassirnasar@gmail.com";

type AuthMode = "login" | "create" | "change";

export default function AdminLoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState(ADMIN_EMAIL);

  const [password, setPassword] = useState("");

  const [createPassword, setCreatePassword] = useState("");
  const [confirmCreatePassword, setConfirmCreatePassword] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isAdminEmail = email.trim().toLowerCase() === ADMIN_EMAIL;

  const clearFields = () => {
    setPassword("");
    setCreatePassword("");
    setConfirmCreatePassword("");
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("");
  };

  const handleLogin = async () => {
    setMessage("");

    if (!isAdminEmail) {
      setMessage("Only the registered admin email can access this dashboard.");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePassword = async () => {
    setMessage("");

    if (!isAdminEmail) {
      setMessage("Only the registered admin email can create a password.");
      return;
    }

    if (!createPassword || !confirmCreatePassword) {
      setMessage("Please enter password and re-enter password.");
      return;
    }

    if (createPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (createPassword !== confirmCreatePassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/create-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: createPassword,
          confirmPassword: confirmCreatePassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "Could not create admin password.");
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: createPassword,
      });

      if (loginError) {
        setMessage(
          "Password created successfully. Please login using your new password."
        );
        setMode("login");
        setPassword("");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Create password frontend error:", error);
      setMessage(
        "Could not connect to create-password API. Check your terminal and .env.local."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage("");

    if (!isAdminEmail) {
      setMessage("Only the registered admin email can change password.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setMessage("Please enter old password, new password, and re-enter new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: oldPassword,
      });

      if (loginError) {
        setMessage("Old password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      await supabase.auth.signOut();

      setMessage("Password changed successfully. Please login again.");
      setMode("login");
      setPassword("");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      setMessage("Something went wrong while changing password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7fa] px-6 py-10 text-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 shadow-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-semibold text-[#FF0052]"
        >
          ← Back to website
        </Link>

        <div className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-[#FF0052]/20 bg-[#FF0052]/10 px-4 py-2 text-sm font-semibold text-[#FF0052]">
            KitchBot Admin
          </p>

          <h1 className="text-3xl font-black">Admin Access</h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Login, create password, or change password for the admin account.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-full bg-[#fff7fa] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              clearFields();
            }}
            className={`rounded-full px-3 py-2 text-xs font-bold transition ${
              mode === "login"
                ? "bg-[#FF0052] text-white"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("create");
              clearFields();
            }}
            className={`rounded-full px-3 py-2 text-xs font-bold transition ${
              mode === "create"
                ? "bg-[#FF0052] text-white"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Create
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("change");
              clearFields();
            }}
            className={`rounded-full px-3 py-2 text-xs font-bold transition ${
              mode === "change"
                ? "bg-[#FF0052] text-white"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Change
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold">Admin Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
              placeholder="Admin email"
            />
          </div>

          {mode === "login" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-bold">Password</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleLogin();
                  }}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full rounded-full bg-[#FF0052] px-6 py-3 font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Checking..." : "Login to Dashboard"}
              </button>
            </>
          )}

          {mode === "create" && (
            <>
              <div className="rounded-2xl bg-[#fff7fa] p-4 text-sm leading-6 text-slate-600">
                Create admin password directly. No email link will be sent.
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Password</label>
                <input
                  value={createPassword}
                  onChange={(event) => setCreatePassword(event.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Create password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Re-enter Password
                </label>
                <input
                  value={confirmCreatePassword}
                  onChange={(event) =>
                    setConfirmCreatePassword(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleCreatePassword();
                  }}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="button"
                onClick={handleCreatePassword}
                disabled={isLoading}
                className="w-full rounded-full bg-[#FF0052] px-6 py-3 font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating..." : "Create Password"}
              </button>
            </>
          )}

          {mode === "change" && (
            <>
              <div className="rounded-2xl bg-[#fff7fa] p-4 text-sm leading-6 text-slate-600">
                Enter old password first, then set a new password.
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Old Password
                </label>
                <input
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Enter old password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  New Password
                </label>
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Re-enter New Password
                </label>
                <input
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleChangePassword();
                  }}
                  type="password"
                  className="w-full rounded-2xl border border-pink-100 bg-[#fff7fa] px-4 py-3 text-sm outline-none focus:border-[#FF0052]"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full rounded-full bg-[#FF0052] px-6 py-3 font-bold text-white transition hover:bg-[#e60049] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Updating..." : "Change Password"}
              </button>
            </>
          )}
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-pink-100 bg-[#fff7fa] p-4 text-sm leading-6 text-slate-700">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}