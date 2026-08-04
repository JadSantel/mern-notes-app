import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar noteCount={0} />
      <section className="flex h-full w-80 shrink-0 flex-col border-r border-dark-border bg-dark-bg">
        <div className="p-4 text-dark-text-secondary text-sm">Note list goes here</div>
      </section>
      <div className="flex flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
        <EmptyState icon={FileText} title="No note selected" description="Pick a note from the list, or create a new one." />
      </div>
    </div>
  );
}
