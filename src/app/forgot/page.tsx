"use client";
import React, { useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import { forgotPassword } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    setMsg(null);

    if (!email.trim()) {
      setClientError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(forgotPassword(email.trim())).unwrap();
      setMsg(res.message || "If the email exists, a reset was sent");
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Failed to send reset");
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
      >
        <img src={"/assets/images/logo.svg"} alt="logo" />
        <div className="header">
          <motion.h1 layout>Forgotten your password?</motion.h1>
          <p>Enter your email and we’ll send you a reset link.</p>
        </div>
        <motion.form
          className="main"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <label htmlFor="email">
            <p>Email Address</p>
            <motion.input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              whileFocus={{ scale: 1.02 }}
            />
          </label>
          <motion.button
            className="loginBtn"
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            ) : (
              "Send Reset Link"
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
