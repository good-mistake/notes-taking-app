"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { resetPassword } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [clientError, setClientError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const token = searchParams?.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setMsg(null);

    if (!newPassword || !confirm) {
      setClientError("Please fill both fields");
      return;
    }
    if (newPassword !== confirm) {
      setClientError("Passwords do not match");
      return;
    }
    if (!token) {
      setClientError("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(
        resetPassword({ token, newPassword })
      ).unwrap();
      setMsg(res.message || "Password reset successful");
      router.push("/login");
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <motion.div
        className="loginContainer"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <img src={"/assets/images/logo.svg"} alt="logo" />
        <div className="header">
          <motion.h1 layout>Reset Your Password</motion.h1>
          <p>Choose a new password to secure your account.</p>
        </div>

        <motion.form
          className="main"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <label>
            <p>Password</p>
            <motion.input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </label>

          <label>
            <p>Confirm New Password</p>
            <motion.input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </label>

          <motion.button
            className="loginBtn"
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            ) : (
              "Reset Password"
            )}
          </motion.button>

          <AnimatePresence>
            {(clientError || msg) && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="error"
              >
                {clientError ?? msg}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Page;
