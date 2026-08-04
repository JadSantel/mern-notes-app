import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!username.trim()) errors.username = "Username is required";
    else if (username.trim().length < 3) errors.username = "Must be at least 3 characters";
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Must be at least 6 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords don't match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsSubmitting(true);
    try {
      await register(username, email, password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Field = ({ label, error, ...inputProps }) => (
    <label className="flex flex-col gap-1.5 text-sm text-dark-text-secondary">
      {label}
      <input
        {...inputProps}
        className={`rounded-lg border bg-dark-bg px-3 py-2 text-dark-text placeholder:text-dark-text-placeholder focus:outline-none ${error ? "border-danger" : "border-dark-border"
          }`}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );

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
          <h1 className="text-xl font-bold text-dark-text">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} error={fieldErrors.username} />
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
          <Field label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={fieldErrors.confirmPassword} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent-orange py-2.5 font-medium text-white transition-colors hover:bg-accent-orange-hover disabled:opacity-60"
          >
            {isSubmitting && <Spinner size={16} />}
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent-orange hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
