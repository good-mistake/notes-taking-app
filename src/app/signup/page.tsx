"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerUser } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

const Page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, loading, error: serverError } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (token) router.push("/");
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!email.trim() || !password) {
      setClientError("Please enter email and password");
      return;
    }
    if (password.length < 8) {
      setClientError("Password must be at least 8 characters");
      return;
    }

    try {
      await dispatch(registerUser({ email: email.trim(), password })).unwrap();
      router.push("/login");
    } catch (err) {
      setClientError(typeof err === "string" ? err : "Signup failed");
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
          <motion.h1 layout>Create Your Account</motion.h1>
          <p>Sign up to start organizing your notes.</p>
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
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </label>

          <label htmlFor="password">
            <div className="signUpPass">
              <p>Password</p>
              <div className="inputImg">
                <motion.input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  whileFocus={{ scale: 1.02 }}
                />
                <img
                  src={
                    showPassword
                      ? "/assets/images/icon-hide-password.svg"
                      : "/assets/images/icon-show-password.svg"
                  }
                  alt="toggle"
                  onClick={() => setShowPassword((s) => !s)}
                />
              </div>
            </div>
            <div className="least">
              <img src="/assets/images/icon-clock.svg" alt="clock" />
              <p> At least 8 characters</p>
            </div>
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
              "Sign up"
            )}
          </motion.button>

          <AnimatePresence>
            {(clientError || serverError) && (
              <motion.p
                className="error"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {clientError ?? serverError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        <div className="footer">
          <div className="google">
            <p>Or sign in with:</p>
            <motion.button
              type="button"
              onClick={() => signIn("google")}
              whileTap={{ scale: 0.98 }}
            >
              <img src={"/assets/images/icon-google.svg"} alt="google" />
              <p>Google</p>
            </motion.button>
          </div>

          <div className="or">
            <button type="button" onClick={() => router.push("/login")}>
              Already have an account? <span>Login</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
