import Link from "next/link";
import {
  Flame, Shield, FileText, BarChart3, Building2,
  CheckCircle, ArrowRight, Sparkles, Package,
  MapPin, Clock, QrCode, PenLine, Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-fire flex items-center justify-center shadow">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">FireTrace Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#nfpa"     className="hover:text-slate-900 transition-colors">NFPA 921</a>
            <a href="#roles"    className="hover:text-slate-900 transition-colors">Who It&apos;s For</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-authority-800 text-white px-4 py-2 rounded-lg hover:bg-authority-900 transition-colors shadow-sm"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 gradient-authority relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-fire-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-authority-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" />
            NFPA 921 · NFPA 1033 Compliant
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Every fire tells<br />
            <span className="text-fire-400">a story.</span><br />
            We help you read it.
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            FireTrace Pro is the first end-to-end fire investigation platform built on NFPA 921 standards — combining AI-assisted cause analysis, digital chain of custody, and court-ready report generation in one modern tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-fire-600 hover:bg-fire-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
            >
              Start Free Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
            >
              See All Features
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { val: "NFPA 921", label: "Fully Compliant" },
              { val: "5",        label: "User Roles" },
              { val: "7-Step",   label: "Investigation Wizard" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Built for the field. Built for the courtroom.
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Every feature is designed around NFPA 921 methodology — from scene documentation to final report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                color: "bg-authority-100 text-authority-800",
                title: "NFPA 921 Wizard",
                desc: "7-step guided investigation workflow enforcing NFPA 921 methodology at every field. Zod-validated — can't advance until required data is complete.",
                badge: "NFPA 921 §12–20",
              },
              {
                icon: Sparkles,
                color: "bg-fire-100 text-fire-700",
                title: "AI Cause Analysis",
                desc: "Claude AI analyzes your documented fire patterns and evidence, streaming a NFPA-coded cause classification with section-by-section reasoning.",
                badge: "Powered by Claude",
              },
              {
                icon: FileText,
                color: "bg-green-100 text-green-700",
                title: "Court-Ready Reports",
                desc: "Live report builder with section toggles and one-click PDF export. Branded header, evidence tables, chain of custody, and investigator signature block.",
                badge: "PDF Export",
              },
              {
                icon: Package,
                color: "bg-purple-100 text-purple-700",
                title: "Chain of Custody",
                desc: "Full digital chain of custody with timestamped entries, digital signatures via canvas, and lab submission tracking per NFPA 921 §15.3.",
                badge: "NFPA 921 §15",
              },
              {
                icon: QrCode,
                color: "bg-slate-100 text-slate-700",
                title: "QR Evidence Labels",
                desc: "Generate print-ready QR labels for evidence bags. Scan any label to pull up the full digital record instantly — no manual lookup required.",
                badge: "Print-ready",
              },
              {
                icon: BarChart3,
                color: "bg-orange-100 text-orange-700",
                title: "Analytics Dashboard",
                desc: "12-month cause trend charts, NFPA compliance scores, case status KPIs, and fire cause breakdown — everything a fire marshal needs at a glance.",
                badge: "Real-time",
              },
              {
                icon: Building2,
                color: "bg-teal-100 text-teal-700",
                title: "Insurance Portal",
                desc: "Dedicated adjuster workflow with policy linkage, estimated loss tracking, and claim status management — linked directly to investigation records.",
                badge: "Claims workflow",
              },
              {
                icon: MapPin,
                color: "bg-red-100 text-red-700",
                title: "Fire Pattern Library",
                desc: "Document V-patterns, char depth, pour patterns, spalling, and 9 other NFPA-classified fire patterns with photo attachment and significance notes.",
                badge: "NFPA 921 §6",
              },
              {
                icon: CheckCircle,
                color: "bg-emerald-100 text-emerald-700",
                title: "Compliance Meter",
                desc: "Real-time NFPA 921 compliance score that updates as investigators tick off checklist requirements — 22 items across 5 categories.",
                badge: "22 checkpoints",
              },
            ].map(({ icon: Icon, color, title, desc, badge }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{desc}</p>
                <span className="text-xs font-medium text-authority-700 bg-authority-50 px-2.5 py-1 rounded-full">
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFPA 921 section */}
      <section id="nfpa" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Standards Compliance</p>
              <h2 className="text-3xl font-black text-slate-900 mb-5">
                Built on NFPA 921, <br />not around it.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Every field, every step, and every report section is mapped to a specific NFPA 921 or NFPA 1033 section. FireTrace Pro isn&apos;t a generic form builder with a fire theme — it&apos;s a structured methodology enforcer.
              </p>
              <div className="space-y-3">
                {[
                  { std: "NFPA 921", desc: "Guide for Fire and Explosion Investigations — origin, cause, fire patterns, methodology" },
                  { std: "NFPA 1033", desc: "Professional Qualifications for Fire Investigator — certification tracking, report sign-off" },
                  { std: "NFPA 72",  desc: "National Fire Alarm and Signaling Code — electrical cause classification" },
                ].map(({ std, desc }) => (
                  <div key={std} className="flex gap-3">
                    <div className="w-16 shrink-0 text-xs font-black text-authority-800 bg-authority-50 rounded-lg flex items-center justify-center py-1.5 border border-authority-100">
                      {std}
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono text-slate-300 space-y-2 shadow-xl">
              <p className="text-slate-500 text-xs mb-4">// NFPA 921 Compliance Checklist</p>
              {[
                { done: true,  text: "Scene safety assessment" },
                { done: true,  text: "Legal authority established" },
                { done: true,  text: "Systematic photo documentation" },
                { done: true,  text: "Fire pattern analysis (§6.3)" },
                { done: true,  text: "Area of origin — §14.3" },
                { done: true,  text: "Point of origin — §14.4" },
                { done: false, text: "Alternative hypotheses — §17.4" },
                { done: false, text: "Cause classification — §20" },
              ].map(({ done, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className={done ? "text-green-400" : "text-slate-600"}>{done ? "✓" : "○"}</span>
                  <span className={done ? "text-slate-200" : "text-slate-500"}>{text}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Compliance score</span>
                  <span className="text-green-400 font-bold">75% → 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="roles" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Built for Every Role</p>
            <h2 className="text-3xl font-black text-slate-900">One platform. Three workflows.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role:     "Firefighters",
                icon:     "🚒",
                color:    "border-fire-200 bg-fire-50",
                titleColor: "text-fire-800",
                features: [
                  "Scene documentation from the field",
                  "Photo upload per evidence item",
                  "Initial incident report intake",
                  "Dispatch time logging",
                ],
              },
              {
                role:     "Fire Investigators",
                icon:     "🔍",
                color:    "border-authority-200 bg-authority-50",
                titleColor: "text-authority-800",
                features: [
                  "Full NFPA 921 investigation wizard",
                  "AI-powered cause classification",
                  "Fire pattern library & documentation",
                  "Court-ready report builder",
                  "NFPA 1033 compliance tracking",
                ],
              },
              {
                role:     "Insurance Companies",
                icon:     "🏢",
                color:    "border-green-200 bg-green-50",
                titleColor: "text-green-800",
                features: [
                  "Claims management portal",
                  "Policy + investigation linkage",
                  "Incendiary flag alerts",
                  "Loss estimate tracking",
                  "NFPA cause code on every claim",
                ],
              },
            ].map(({ role, icon, color, titleColor, features }) => (
              <div key={role} className={`border-2 rounded-2xl p-6 ${color}`}>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className={`text-lg font-bold mb-4 ${titleColor}`}>{role}</h3>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 gradient-authority">
        <div className="max-w-2xl mx-auto text-center">
          <Flame className="w-10 h-10 text-fire-400 mx-auto mb-5" />
          <h2 className="text-3xl font-black text-white mb-4">
            Start your first NFPA 921 investigation today.
          </h2>
          <p className="text-white/70 mb-8">
            Demo account loaded with sample investigations, evidence, and insurance claims — ready in 30 seconds.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-fire-600 hover:bg-fire-700 text-white font-bold px-10 py-4 rounded-xl shadow-xl text-sm transition-all hover:scale-105"
          >
            Launch Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/40 text-xs mt-4">
            Use admin@firetrace.app / demo1234 to sign in
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-fire flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">FireTrace Pro</span>
          </div>
          <p className="text-xs text-center">
            NFPA 921 · NFPA 1033 Compliant · Built with Claude AI
          </p>
          <p className="text-xs">© 2024 FireTrace Pro</p>
        </div>
      </footer>
    </div>
  );
}
