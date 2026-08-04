export default function EmptyState({ icon: Icon, title, description }) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
        {Icon && (
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-pastel-peach">
            <Icon size={22} className="text-accent-orange" />
          </div>
        )}
        <p className="font-semibold text-light-text dark:text-dark-text">{title}</p>
        {description && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary max-w-xs">
            {description}
          </p>
        )}
      </div>
    );
  }