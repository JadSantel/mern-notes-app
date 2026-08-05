import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const { login = async () => { } } = useAuth() ?? {};
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      setShake(true)
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={shake ? { x: [-8, 8, -8, 8, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ duration: shake ? 0.4 : 0.3, ease: "easeOut" }}
        className="w-full max-w-sm rounded-2xl bg-dark-surface p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-orange text-xl font-bold text-white">
            N
          </div>
          <h1 className="text-xl font-bold text-dark-text">Welcome Back</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent-orange py-2.5 font-medium text-white transition-colors hover:bg-accent-orange-hover disabled:opacity-60"
          >
            {isSubmitting && <Spinner size={16} />}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-text-secondary">
          No account?{" "}
          <Link to="/register" className="font-medium text-accent-orange hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
