"use client";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setTheme, setFont } from "../redux/uiSlice";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { changePassword, logout } from "../redux/authSlice";
import { signOut } from "next-auth/react";
import { toggleSettings } from "../redux/noteSlice";
import { useWindowSize } from "./useWindowSize";
import Footer from "./Footer";
const Setting = () => {
  const [view, setView] = useState<
    "color" | "font" | "password" | "login" | ""
  >("");
  const [viewTablet, setViewTablet] = useState<"setting" | "options" | "">(
    "setting"
  );
  const router = useRouter();
  const { setTheme: setNextTheme } = useTheme();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const theme = useAppSelector((state) => state.ui.theme);
  const font = useAppSelector((state) => state.ui.font);

  const [pendingTheme, setPendingTheme] = useState(theme);
  const [pendingFont, setPendingFont] = useState(font);
  const { isTablet } = useWindowSize();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState<{
    old: boolean;
    new: boolean;
    confirm: boolean;
  }>({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = useAppSelector((state) => state.auth.token);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    setNextTheme(theme);
  }, [theme, setNextTheme]);

  const handleAuth = () => {
    if (isLoggedIn) {
      dispatch(logout());
      localStorage.removeItem("token");

      signOut({ redirect: false });
      router.push("/");
      dispatch(toggleSettings());
    } else {
      router.push("/login");
      dispatch(toggleSettings());
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);

      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);

      return;
    }

    try {
      const res = await dispatch(
        changePassword({ oldPassword, newPassword })
      ).unwrap();

      setSuccess(res.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to change password");
      setLoading(false);
    }
  };
  const themeOptions: ("light" | "dark" | "system")[] = [
    "light",
    "dark",
    "system",
  ];
  const fontOptions: ("default" | "serif" | "source")[] = [
    "default",
    "serif",
    "source",
  ];

  const togglePassword = (field: "old" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  return (
    <div className="settingMenu">
      {isTablet && viewTablet === "setting" ? (
        <ul>
          <div className="Ui">
            <li
              onClick={() => {
                setView("color");
                setViewTablet("options");
              }}
              className={view === "color" ? "active" : ""}
            >
              <img src="/assets/images/icon-sun.svg" alt="sun" />
              <p>Color Theme</p>
              {view === "color" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
            <li
              onClick={() => {
                setView("font");
                setViewTablet("options");
              }}
              className={view === "font" ? "active" : ""}
            >
              <img src="/assets/images/icon-font.svg" alt="font" />
              <p>Font Theme</p>
              {view === "font" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
            <li
              onClick={() => {
                setView("password");
                setViewTablet("options");
              }}
              className={view === "password" ? "active" : ""}
            >
              <img src="/assets/images/icon-lock.svg" alt="lock" />
              <p>Change Password</p>
              {view === "password" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
          </div>
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="loginOrLogout"
          >
            <button
              aria-label="loginBtn"
              onClick={handleAuth}
              className={isLoggedIn ? "logoutBtn" : "loginBtn"}
            >
              <img src="/assets/images/icon-logout.svg" alt="logout" />
              <p>{isLoggedIn ? "Logout" : "Login"}</p>
            </button>
          </motion.div>
        </ul>
      ) : !isTablet ? (
        <ul>
          <div className="Ui">
            <li
              onClick={() => setView("color")}
              className={view === "color" ? "active" : ""}
            >
              <img src="/assets/images/icon-sun.svg" alt="sun" />
              <p>Color Theme</p>
              {view === "color" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
            <li
              onClick={() => setView("font")}
              className={view === "font" ? "active" : ""}
            >
              <img src="/assets/images/icon-font.svg" alt="font" />
              <p>Font Theme</p>
              {view === "font" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
            <li
              onClick={() => setView("password")}
              className={view === "password" ? "active" : ""}
            >
              <img src="/assets/images/icon-lock.svg" alt="lock" />
              <p>Change Password</p>
              {view === "password" && (
                <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              )}
            </li>
          </div>
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="loginOrLogout"
          >
            <button
              aria-label="loginBtn"
              onClick={handleAuth}
              className={isLoggedIn ? "logoutBtn" : "loginBtn"}
            >
              <img src="/assets/images/icon-logout.svg" alt="logout" />
              <p>{isLoggedIn ? "Logout" : "Login"}</p>
            </button>
          </motion.div>
        </ul>
      ) : (
        ""
      )}
      {isTablet && viewTablet === "options" ? (
        <section className="UIoptions">
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="back"
          >
            <button
              aria-label="backBtn"
              onClick={() => setViewTablet("setting")}
            >
              <img src="/assets/images/icon-chevron-right.svg" alt="arrow" />
              <p>Settings</p>
            </button>
          </motion.div>
          <AnimatePresence mode="wait">
            {view === "color" && (
              <motion.div
                key="color"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Color Theme</h2>
                <h5>Choose your color theme:</h5>
                <div className="customSelect">
                  {themeOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`customOption ${
                        pendingTheme === opt ? "active" : ""
                      }`}
                      onClick={() => setPendingTheme(opt)}
                    >
                      <img
                        src={`/assets/images/icon-${
                          opt === "light"
                            ? "sun"
                            : opt === "dark"
                            ? "moon"
                            : "system-theme"
                        }.svg`}
                        alt={opt}
                      />
                      <div>
                        <h4>
                          {opt === "light"
                            ? "Light Mode"
                            : opt === "dark"
                            ? "Dark Mode"
                            : "System"}
                        </h4>
                        <p>
                          {opt === "light"
                            ? "Pick a clean and classic light theme"
                            : opt === "dark"
                            ? "Select a sleek and modern dark theme"
                            : "Adapts to your device’s theme"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  aria-label="colorBtn"
                  onClick={() => dispatch(setTheme(pendingTheme))}
                >
                  Apply Changes
                </button>
              </motion.div>
            )}

            {view === "font" && (
              <motion.div
                key="font"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Font Theme</h2>
                <h5>Choose your font theme:</h5>
                <div className="customSelect">
                  {fontOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`customOption ${
                        pendingFont === opt ? "active" : ""
                      }`}
                      onClick={() => setPendingFont(opt)}
                    >
                      <article className="imgContainer">
                        <img
                          src={`/assets/images/icon-font-${
                            opt === "default"
                              ? "Sans-serif"
                              : opt === "serif"
                              ? "Serif"
                              : "Monospace"
                          }.svg`}
                          alt={opt}
                        />
                      </article>
                      <div>
                        <h4>
                          {opt === "default"
                            ? "Sans-serif"
                            : opt === "serif"
                            ? "Serif"
                            : "Monospace"}
                        </h4>
                        <p>
                          {opt === "default"
                            ? "Clean and modern, easy to read."
                            : opt === "serif"
                            ? "Classic and elegant for a timeless feel."
                            : "Code-like, great for a technical vibe."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  aria-label="fontBtn"
                  onClick={() => dispatch(setFont(pendingFont))}
                >
                  Apply Changes
                </button>
              </motion.div>
            )}

            {view === "password" &&
              (isLoggedIn ? (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="passworContainer"
                >
                  <h2>Change Password</h2>
                  <form onSubmit={handleChangePassword}>
                    <label htmlFor="passwordO">
                      <p>Old Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.old ? "text" : "password"}
                          name="passwordO"
                          id="passwordO"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.old
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="show"
                          onClick={() => togglePassword("old")}
                        />
                      </div>
                    </label>
                    <label htmlFor="passwordN">
                      <p>New Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="passwordN"
                          id="passwordN"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.new
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="toggle"
                          onClick={() => togglePassword("new")}
                        />
                      </div>
                      <div className="least">
                        <img src="/assets/images/icon-clock.svg" alt="clock" />
                        <p> At least 8 characters</p>
                      </div>
                    </label>
                    <label htmlFor="passwordCO">
                      <p>Confirm New Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="passwordCO"
                          id="passwordCO"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.confirm
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="toggle"
                          onClick={() => togglePassword("confirm")}
                        />
                      </div>
                    </label>
                    <button
                      aria-label="passBtn"
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        "Save Password"
                      )}
                    </button>
                  </form>
                  {error && <p className="error">{error}</p>}
                  {success && <p className="success">{success}</p>}
                </motion.div>
              ) : (
                <h5 className="loginToSee">
                  <button
                    aria-label="loginBtn2"
                    onClick={() => router.push("/login")}
                  >
                    <p>{"Login"}</p>
                  </button>{" "}
                  to see this sections
                </h5>
              ))}
          </AnimatePresence>
        </section>
      ) : !isTablet ? (
        <section className="UIoptions">
          <AnimatePresence mode="wait">
            {view === "color" && (
              <motion.div
                key="color"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Color Theme</h2>
                <h5>Choose your color theme:</h5>
                <div className="customSelect">
                  {themeOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`customOption ${
                        pendingTheme === opt ? "active" : ""
                      }`}
                      onClick={() => setPendingTheme(opt)}
                    >
                      <img
                        src={`/assets/images/icon-${
                          opt === "light"
                            ? "sun"
                            : opt === "dark"
                            ? "moon"
                            : "system-theme"
                        }.svg`}
                        alt={opt}
                      />
                      <div>
                        <h4>
                          {opt === "light"
                            ? "Light Mode"
                            : opt === "dark"
                            ? "Dark Mode"
                            : "System"}
                        </h4>
                        <p>
                          {opt === "light"
                            ? "Pick a clean and classic light theme"
                            : opt === "dark"
                            ? "Select a sleek and modern dark theme"
                            : "Adapts to your device’s theme"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  aria-label="colorBtn"
                  onClick={() => dispatch(setTheme(pendingTheme))}
                >
                  Apply Changes
                </button>
              </motion.div>
            )}

            {view === "font" && (
              <motion.div
                key="font"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Font Theme</h2>
                <h5>Choose your font theme:</h5>
                <div className="customSelect">
                  {fontOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`customOption ${
                        pendingFont === opt ? "active" : ""
                      }`}
                      onClick={() => setPendingFont(opt)}
                    >
                      <article className="imgContainer">
                        <img
                          src={`/assets/images/icon-font-${
                            opt === "default"
                              ? "Sans-serif"
                              : opt === "serif"
                              ? "Serif"
                              : "Monospace"
                          }.svg`}
                          alt={opt}
                        />
                      </article>
                      <div>
                        <h4>
                          {opt === "default"
                            ? "Sans-serif"
                            : opt === "serif"
                            ? "Serif"
                            : "Monospace"}
                        </h4>
                        <p>
                          {opt === "default"
                            ? "Clean and modern, easy to read."
                            : opt === "serif"
                            ? "Classic and elegant for a timeless feel."
                            : "Code-like, great for a technical vibe."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  aria-label="fontBtn"
                  onClick={() => dispatch(setFont(pendingFont))}
                >
                  Apply Changes
                </button>
              </motion.div>
            )}

            {view === "password" &&
              (isLoggedIn ? (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="passworContainer"
                >
                  <h2>Change Password</h2>
                  <form onSubmit={handleChangePassword}>
                    <label htmlFor="passwordO">
                      <p>Old Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.old ? "text" : "password"}
                          name="passwordO"
                          id="passwordO"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.old
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="show"
                          onClick={() => togglePassword("old")}
                        />
                      </div>
                    </label>
                    <label htmlFor="passwordN">
                      <p>New Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="passwordN"
                          id="passwordN"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.new
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="toggle"
                          onClick={() => togglePassword("new")}
                        />
                      </div>
                      <div className="least">
                        <img src="/assets/images/icon-clock.svg" alt="clock" />
                        <p> At least 8 characters</p>
                      </div>
                    </label>
                    <label htmlFor="passwordCO">
                      <p>Confirm New Password</p>
                      <div className="inputImg">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="passwordCO"
                          id="passwordCO"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <img
                          src={
                            showPassword.confirm
                              ? "/assets/images/icon-hide-password.svg"
                              : "/assets/images/icon-show-password.svg"
                          }
                          alt="toggle"
                          onClick={() => togglePassword("confirm")}
                        />
                      </div>
                    </label>
                    <button
                      aria-label="passBtn"
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        "Save Password"
                      )}
                    </button>
                  </form>
                  {error && <p className="error">{error}</p>}
                  {success && <p className="success">{success}</p>}
                </motion.div>
              ) : (
                <h5 className="loginToSee">
                  <button
                    aria-label="loginBtn2"
                    onClick={() => router.push("/login")}
                  >
                    <p>{"Login"}</p>
                  </button>{" "}
                  to see this sections
                </h5>
              ))}
          </AnimatePresence>
        </section>
      ) : (
        ""
      )}
      {isTablet && <Footer />}
    </div>
  );
};

export default Setting;
