import { Header } from "@/components/layout/Header";
import { WizardShell } from "@/components/investigation/wizard/WizardShell";

export default function NewInvestigationPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="New Investigation"
        subtitle="NFPA 921 guided investigation wizard"
      />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl border border-slate-200 h-full p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">Fire Investigation — NFPA 921 Workflow</h2>
            <p className="text-sm text-slate-500 mt-1">
              Complete all 7 steps to create a fully NFPA 921-compliant investigation record. Required fields are marked with <span className="text-red-500">*</span>.
            </p>
          </div>
          <WizardShell />
        </div>
      </div>
    </div>
  );
}
