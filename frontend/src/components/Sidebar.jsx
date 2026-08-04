import { StickyNote, Settings, LogOut, FolderClosed } from "lucide-react";
  import { useAuth } from "../context/AuthContext";
  import Avatar from "./Avatar";
  import ThemeToggle from "./ThemeToggle";

  export default function Sidebar({ noteCount = 0 }) {
    const { user, logout } = useAuth();

    return (
      <aside
        className="flex h-full w-60 shrink-0 flex-col border-r border-dark-border bg-dark-bg text-dark-text"
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange text-white font-bold">
            N
          </div>
          <span className="font-semibold text-lg">Notes</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-2 rounded-lg bg-dark-surface px-3 py-2 text-sm font-medium text-dark-text"
          >
            <StickyNote size={16} />
            All Notes
            <span className="ml-auto text-xs text-dark-text-placeholder">{noteCount}</span>
          </button>

          <p className="mt-5 mb-1 px-3 text-xs font-medium uppercase tracking-wide text-dark-text-placeholder">
            Folders
          </p>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-placeholder">
            <FolderClosed size={16} />
            Coming soon
          </div>
        </nav>

        <div className="border-t border-dark-border p-3">
          <button
            type="button"
            aria-label="Settings"
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            type="button"
            onClick={logout}
            className="mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={user?.username} size={32} />
              <span className="text-sm font-medium truncate max-w-25">{user?.username}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    );
  }