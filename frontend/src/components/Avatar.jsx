function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === "") return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  export default function Avatar({ name, size = 36 }) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-accent-orange text-white font-semibold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${name || "User"} avatar`}
      >
        {getInitials(name)}
      </div>
    );
  }