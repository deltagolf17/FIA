import Link from "next/link";
import {
  Flame, Shield, FileText, BarChart3, Building2,
  CheckCircle, ArrowRight, Sparkles, Package,
  MapPin, Clock, QrCode, Zap, Users, Radio,
  TrendingUp, Lock, Cloud,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-fire flex items-center justify-center shadow">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">FireTrace Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#roles"    className="hover:text-slate-900 transition-colors">Who It&apos;s For</a>
            <a href="#nfpa"     className="hover:text-slate-900 transition-colors">NFPA 921</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-authority-800 text-white px-4 py-2 rounded-lg hover:bg-authority-900 transition-colors shadow-sm">
              Launch Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 gradient-authority relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-fire-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-authority-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            NFPA 921 · NFPA 1033 · Built for Australia
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
            Every fire tells<br />
            <span className="text-fire-400">a story.</span><br />
            <span className="text-white/90">We help you read it.</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            FireTrace Pro is the first end-to-end digital fire investigation platform built on NFPA 921 — combining AI-assisted cause analysis, digital chain of custody, live incident feeds, and court-ready report generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 bg-fire-600 hover:bg-fire-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all text-sm hover:scale-105">
              Start Free Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm">
              See All Features
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { val: "NFPA 921", sub: "Fully Compliant" },
              { val: "8-Step",   sub: "Investigation Wizard" },
              { val: "5 Roles",  sub: "Role-Based Access" },
              { val: "AI",       sub: "Claude-Powered Analysis" },
            ].map(({ val, sub }) => (
              <div key={sub} className="text-center">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-white/50 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCK UI PREVIEW */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Live Platform Preview</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">See it in action</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Everything you need from scene arrival to court submission — in one platform.</p>
          </div>

          {/* Mock browser window */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            {/* Browser chrome */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 font-mono border border-slate-200 max-w-xs mx-auto text-center">
                firetrace.app/dashboard
              </div>
            </div>

            {/* Mock app UI */}
            <div className="flex h-[440px]">
              {/* Sidebar */}
              <div className="w-52 bg-authority-900 flex flex-col shrink-0">
                <div className="px-4 py-4 border-b border-authority-700 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg gradient-fire flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">FireTrace Pro</p>
                    <p className="text-[10px] text-authority-400 mt-0.5">NFPA 921 Compliant</p>
                  </div>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-0.5">
                  {[
                    { icon: BarChart3, label: "Dashboard", active: true },
                    { icon: Flame, label: "Investigations", active: false },
                    { icon: Radio, label: "Live Incidents", active: false },
                    { icon: Cloud, label: "Weather Map", active: false },
                    { icon: BarChart3, label: "Analytics", active: false },
                    { icon: Building2, label: "Insurance", active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${active ? "bg-fire-600 text-white" : "text-authority-400"}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </div>
                  ))}
                </nav>
                <div className="px-3 py-3 border-t border-authority-700">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-fire-600 flex items-center justify-center text-[10px] font-bold text-white">AR</div>
                    <div>
                      <p className="text-xs font-medium text-white leading-none">Alex Rodriguez</p>
                      <p className="text-[10px] text-authority-400">Admin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 bg-slate-50 overflow-hidden p-5 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Open Cases",    val: "4",  color: "text-authority-800", bg: "bg-authority-50", dot: "bg-authority-600" },
                    { label: "In Progress",   val: "2",  color: "text-fire-700",      bg: "bg-fire-50",      dot: "bg-fire-500" },
                    { label: "Incendiary",    val: "1",  color: "text-red-700",       bg: "bg-red-50",       dot: "bg-red-500" },
                    { label: "Closed",        val: "1",  color: "text-green-700",     bg: "bg-green-50",     dot: "bg-green-500" },
                  ].map(({ label, val, color, bg, dot }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 border border-white`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                      </div>
                      <p className={`text-2xl font-black ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Cases table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Recent Investigations</p>
                    <span className="text-[10px] text-authority-600 bg-authority-50 px-2 py-0.5 rounded-full font-medium">5 cases</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { case: "FIA-2024-1003", addr: "830 Abernethy Rd, Midland", status: "IN PROGRESS", cause: "INCENDIARY", causeColor: "bg-red-100 text-red-700", statusColor: "bg-orange-100 text-orange-700" },
                      { case: "FIA-2024-1002", addr: "450 Murray St, Perth",      status: "PENDING REVIEW", cause: "ACCIDENTAL", causeColor: "bg-blue-100 text-blue-700", statusColor: "bg-yellow-100 text-yellow-700" },
                      { case: "FIA-2024-1001", addr: "1247 Stirling Hwy, Crawley", status: "CLOSED",     cause: "ACCIDENTAL", causeColor: "bg-blue-100 text-blue-700", statusColor: "bg-green-100 text-green-700" },
                    ].map(({ case: c, addr, status, cause, causeColor, statusColor }) => (
                      <div key={c} className={`px-4 py-2.5 flex items-center gap-3 text-[11px] ${c === "FIA-2024-1003" ? "bg-red-50/40" : ""}`}>
                        <span className="font-mono font-bold text-authority-700 w-28 shrink-0">{c}</span>
                        <span className="flex-1 text-slate-600 truncate">{addr}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${causeColor}`}>{cause}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${statusColor}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">NFPA Compliance Scores</p>
                    <div className="space-y-1.5">
                      {[
                        { case: "FIA-2024-1001", score: 95, color: "bg-green-500" },
                        { case: "FIA-2024-1002", score: 82, color: "bg-authority-600" },
                        { case: "FIA-2024-1003", score: 65, color: "bg-fire-500" },
                      ].map(({ case: c, score, color }) => (
                        <div key={c} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 w-24">{c}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">{score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">AI Cause Analysis</p>
                    <div className="bg-slate-900 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 space-y-1">
                      <p className="text-green-400">✓ V-pattern apex at 920mm AFF</p>
                      <p className="text-green-400">✓ Char depth gradient confirmed</p>
                      <p className="text-yellow-400">→ Classification: ACCIDENTAL</p>
                      <p className="text-authority-300">→ NFPA 921 §20.3 — Cooking fire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Built for the field. Built for the courtroom.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Every feature maps directly to an NFPA 921 section — this is methodology enforcement, not just software.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                color: "bg-authority-100 text-authority-800",
                title: "8-Step NFPA 921 Wizard",
                desc: "Guided investigation workflow that enforces NFPA 921 methodology at every field. Zod-validated — you cannot advance until required data is complete.",
                badge: "NFPA 921 §12–20",
              },
              {
                icon: Sparkles,
                color: "bg-fire-100 text-fire-700",
                title: "AI Cause Analysis",
                desc: "Claude AI streams a NFPA-coded cause classification in real time — analysing your documented fire patterns and evidence with section-by-section reasoning.",
                badge: "Powered by Claude AI",
              },
              {
                icon: FileText,
                color: "bg-green-100 text-green-700",
                title: "Court-Ready PDF Reports",
                desc: "Live report builder with section toggles and one-click PDF export. Branded header, evidence tables, fire pattern analysis, and investigator signature block.",
                badge: "PDF Export",
              },
              {
                icon: Package,
                color: "bg-purple-100 text-purple-700",
                title: "Digital Chain of Custody",
                desc: "Full digital chain of custody with timestamped entries, digital canvas signatures, and lab submission tracking. Meets NFPA 921 §15.3 requirements.",
                badge: "NFPA 921 §15",
              },
              {
                icon: MapPin,
                color: "bg-red-100 text-red-700",
                title: "Fire Pattern Library",
                desc: "Document V-patterns, char depth, pour patterns, spalling, clean burn, and 9 other NFPA-classified patterns with photo attachment and significance notes.",
                badge: "NFPA 921 §6",
              },
              {
                icon: Radio,
                color: "bg-orange-100 text-orange-700",
                title: "Live Incident Feed",
                desc: "Real-time Western Australia emergency incident feed from DFES. Filter by type and region. One-click to start a new investigation from any live incident.",
                badge: "DFES Live Data",
              },
              {
                icon: Cloud,
                color: "bg-sky-100 text-sky-700",
                title: "Weather & BOM Integration",
                desc: "Auto-fills scene weather from the nearest Bureau of Meteorology station at the time of the incident. Wind speed, direction, temperature, humidity — all documented.",
                badge: "BOM Australia",
              },
              {
                icon: QrCode,
                color: "bg-slate-100 text-slate-700",
                title: "QR Evidence Labels",
                desc: "Generate print-ready QR labels for evidence bags. Scan any label to pull up the full digital evidence record instantly — no manual lookup.",
                badge: "Print-ready labels",
              },
              {
                icon: Building2,
                color: "bg-teal-100 text-teal-700",
                title: "Insurance Portal",
                desc: "Dedicated adjuster workflow — policy linkage, estimated loss tracking, incendiary claim flags, and claim status management linked directly to investigation records.",
                badge: "Claims workflow",
              },
              {
                icon: BarChart3,
                color: "bg-indigo-100 text-indigo-700",
                title: "Analytics Dashboard",
                desc: "12-month cause trend charts, NFPA compliance scores, case KPIs, and fire cause breakdown. Everything a fire marshal needs at a glance.",
                badge: "Real-time data",
              },
              {
                icon: CheckCircle,
                color: "bg-emerald-100 text-emerald-700",
                title: "NFPA 921 Compliance Meter",
                desc: "Live compliance score that tracks 22 checklist requirements across 5 NFPA 921 categories. Updates in real time as investigators complete each item.",
                badge: "22 checkpoints",
              },
              {
                icon: Lock,
                color: "bg-rose-100 text-rose-700",
                title: "Role-Based Access Control",
                desc: "Five roles — Firefighter, Investigator, Supervisor, Insurance Adjuster, Admin. Each sees only the features and data relevant to their job.",
                badge: "5 role types",
              },
            ].map(({ icon: Icon, color, title, desc, badge }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow hover:border-slate-300">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{desc}</p>
                <span className="text-xs font-semibold text-authority-700 bg-authority-50 px-2.5 py-1 rounded-full border border-authority-100">
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Investigation Workflow</p>
            <h2 className="text-3xl font-black text-slate-900">From scene arrival to signed report in 8 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Incident Basics",     desc: "Date, address, occupancy type, dispatch and arrival times. Auto-geocoded via Landgate WA.", nfpa: "NFPA 921 §12" },
              { step: "02", title: "Scene Condition",     desc: "Structure type, construction, utility status. Weather auto-filled from nearest BOM station.", nfpa: "NFPA 921 §13" },
              { step: "03", title: "Fire Patterns",       desc: "Document V-patterns, char depth, pour patterns, spalling and more with photos and NFPA references.", nfpa: "NFPA 921 §6" },
              { step: "04", title: "Evidence",            desc: "Collect, photograph and log each item with chain of custody from the scene.", nfpa: "NFPA 921 §15" },
              { step: "05", title: "Origin Determination", desc: "Identify area and point of origin using fire pattern methodology and systematic analysis.", nfpa: "NFPA 921 §14" },
              { step: "06", title: "Cause Classification", desc: "Identify first material ignited, ignition source, and fuel package.", nfpa: "NFPA 921 §20" },
              { step: "07", title: "Final Determination", desc: "AI-assisted NFPA cause classification — Natural, Accidental, Incendiary, or Undetermined.", nfpa: "NFPA 921 §20" },
              { step: "08", title: "Review & Submit",     desc: "Validation check flags missing fields. Submit creates the case and generates the compliance checklist.", nfpa: "NFPA 1033" },
            ].map(({ step, title, desc, nfpa }) => (
              <div key={step} className="bg-white rounded-2xl border border-slate-200 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-7xl font-black text-slate-100 leading-none translate-x-2 -translate-y-2 select-none">{step}</div>
                <div className="relative">
                  <p className="text-xs font-black text-fire-600 mb-2">Step {step}</p>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{desc}</p>
                  <span className="text-[10px] font-semibold text-authority-700 bg-authority-50 px-2 py-0.5 rounded-full">{nfpa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFPA */}
      <section id="nfpa" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Standards Compliance</p>
              <h2 className="text-3xl font-black text-slate-900 mb-5">Built on NFPA 921,<br />not around it.</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Every field, every step, and every report section is mapped to a specific NFPA 921 or NFPA 1033 section. FireTrace Pro is a structured methodology enforcer — not a generic form builder with a fire theme.
              </p>
              <div className="space-y-3">
                {[
                  { std: "NFPA 921",  desc: "Guide for Fire and Explosion Investigations — origin, cause, fire patterns, methodology" },
                  { std: "NFPA 1033", desc: "Professional Qualifications for Fire Investigator — certification tracking, report sign-off" },
                  { std: "NFPA 72",   desc: "National Fire Alarm and Signalling Code — electrical cause classification" },
                  { std: "AFAC",      desc: "Australasian Fire and Emergency Service Authorities Council standards integration" },
                ].map(({ std, desc }) => (
                  <div key={std} className="flex gap-3">
                    <div className="w-20 shrink-0 text-xs font-black text-authority-800 bg-authority-50 rounded-lg flex items-center justify-center py-1.5 border border-authority-100">
                      {std}
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist mock */}
            <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono text-slate-300 space-y-2 shadow-2xl">
              <p className="text-slate-500 text-xs mb-4 uppercase tracking-wide">// NFPA 921 Compliance — FIA-2024-1001</p>
              {[
                { done: true,  text: "Scene safety assessment" },
                { done: true,  text: "Legal authority established" },
                { done: true,  text: "Systematic photo documentation" },
                { done: true,  text: "Fire pattern analysis (§6.3)" },
                { done: true,  text: "Area of origin — §14.3" },
                { done: true,  text: "Point of origin — §14.4" },
                { done: true,  text: "Chain of custody documented" },
                { done: true,  text: "Alternative hypotheses — §17.4" },
                { done: true,  text: "Cause classification — §20" },
                { done: true,  text: "Report signed — NFPA 1033 §4.7" },
              ].map(({ done, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs">
                  <span className={done ? "text-green-400" : "text-slate-600"}>{done ? "✓" : "○"}</span>
                  <span className={done ? "text-slate-200" : "text-slate-500"}>{text}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Compliance score</span>
                  <span className="text-green-400 font-bold">95% — NFPA 921 Compliant</span>
                </div>
                <div className="mt-2 h-2 bg-slate-700 rounded-full">
                  <div className="h-full w-[95%] bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-3">Built for Every Role</p>
            <h2 className="text-3xl font-black text-slate-900">One platform. Five roles. Zero overlap.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Each role sees only what they need. Investigators get the full workflow. Adjusters get the claims portal. Admins manage everything.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                role: "Firefighter",
                icon: "🚒",
                color: "border-fire-200 bg-fire-50",
                titleColor: "text-fire-800",
                features: ["Scene documentation", "Photo upload", "Initial incident intake", "Dispatch time logging"],
              },
              {
                role: "Investigator",
                icon: "🔍",
                color: "border-authority-200 bg-authority-50",
                titleColor: "text-authority-800",
                features: ["Full 8-step wizard", "AI cause analysis", "Fire pattern library", "Report builder", "Chain of custody"],
              },
              {
                role: "Supervisor",
                icon: "📋",
                color: "border-purple-200 bg-purple-50",
                titleColor: "text-purple-800",
                features: ["Review & approve", "Reassign cases", "Compliance overview", "Team analytics"],
              },
              {
                role: "Adjuster",
                icon: "🏢",
                color: "border-teal-200 bg-teal-50",
                titleColor: "text-teal-800",
                features: ["Claims portal", "Policy linkage", "Loss tracking", "Incendiary alerts"],
              },
              {
                role: "Admin",
                icon: "⚙️",
                color: "border-slate-200 bg-slate-50",
                titleColor: "text-slate-800",
                features: ["User management", "Department config", "All role access", "System settings"],
              },
            ].map(({ role, icon, color, titleColor, features }) => (
              <div key={role} className={`border-2 rounded-2xl p-5 ${color}`}>
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className={`text-sm font-bold mb-3 ${titleColor}`}>{role}</h3>
                <ul className="space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO CREDENTIALS */}
      <section className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-fire-600 uppercase tracking-widest mb-2">Try It Now</p>
            <h2 className="text-2xl font-black text-slate-900">Demo accounts — loaded with real investigation data</h2>
            <p className="text-slate-500 mt-2 text-sm">5 WA-based investigations, evidence, fire patterns, insurance claims, and chain of custody entries ready to explore.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { role: "Admin",       email: "admin@firetrace.app",       name: "Alex Rodriguez",  badge: "Full access" },
              { role: "Investigator", email: "investigator@firetrace.app", name: "Sarah Chen",      badge: "Investigation workflow" },
              { role: "Supervisor",  email: "supervisor@firetrace.app",   name: "David Okafor",    badge: "Review & approve" },
              { role: "Firefighter", email: "firefighter@firetrace.app",  name: "Marcus Williams", badge: "Scene docs" },
              { role: "Adjuster",    email: "adjuster@firetrace.app",     name: "Jennifer Park",   badge: "Claims portal" },
            ].map(({ role, email, name, badge }) => (
              <Link key={role} href="/login" className="group flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-authority-300 hover:bg-authority-50 transition-all">
                <div className="w-9 h-9 rounded-full bg-authority-800 flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:bg-fire-600 transition-colors">
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-authority-700 bg-authority-100 px-1.5 py-0.5 rounded">{role}</span>
                    <span className="text-[10px] text-slate-400">{badge}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-authority-700 transition-colors mt-0.5 shrink-0" />
              </Link>
            ))}
            <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-slate-200 text-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">All accounts use</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">demo1234</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 gradient-authority relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-fire-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-authority-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <Flame className="w-12 h-12 text-fire-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">
            Start your first NFPA 921<br />investigation today.
          </h2>
          <p className="text-white/70 mb-10 text-lg">
            Five demo accounts. Five WA investigations. Real data. No setup required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-fire-600 hover:bg-fire-700 text-white font-bold px-12 py-4 rounded-xl shadow-2xl text-base transition-all hover:scale-105"
          >
            Launch Demo Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/40 text-xs mt-5">
            admin@firetrace.app · demo1234
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-fire flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">FireTrace Pro</p>
                <p className="text-xs text-slate-500">Every fire tells a story. We help you read it.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs">
              <a href="#features"  className="hover:text-white transition-colors">Features</a>
              <a href="#workflow"  className="hover:text-white transition-colors">Workflow</a>
              <a href="#nfpa"      className="hover:text-white transition-colors">NFPA 921</a>
              <a href="#roles"     className="hover:text-white transition-colors">Roles</a>
              <Link href="/login"  className="hover:text-white transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2025 FireTrace Pro · Built for Western Australia · DFES Compatible</p>
            <p>NFPA 921 · NFPA 1033 · AFAC Compliant · Powered by Claude AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
