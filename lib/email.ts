const FROM = process.env.EMAIL_FROM ?? "FireTrace Pro <alerts@firetrace.app>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail(
  to: string[],
  subject: string,
  html: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[FireTrace Email - no RESEND_API_KEY configured]`);
    console.log(`  To: ${to.join(", ")}`);
    console.log(`  Subject: ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[FireTrace Email] Resend error:", err);
    }
  } catch (e) {
    console.error("[FireTrace Email] Failed to send:", e);
  }
}

export function incendiaryAlertHtml(opts: {
  caseNumber: string;
  address: string;
  city: string;
  state: string;
  investigatorName: string;
  investigationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a 0%,#ea580c 100%);padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;">🔥</div>
        <span style="color:white;font-weight:700;font-size:16px;">FireTrace Pro</span>
      </div>
      <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">⚠️ Incendiary Fire Alert</h1>
      <p style="color:rgba(255,255,255,.75);margin:6px 0 0;font-size:14px;">Immediate attention required</p>
    </div>
    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="color:#0f172a;font-size:15px;margin:0 0 20px;">
        Investigation <strong>${opts.caseNumber}</strong> has been classified as
        <span style="background:#fee2e2;color:#991b1b;font-weight:700;padding:2px 8px;border-radius:6px;">INCENDIARY</span>
        by ${opts.investigatorName}.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <div style="margin-bottom:8px;">
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Case Number</span>
          <div style="font-family:monospace;font-size:15px;font-weight:700;color:#1e3a8a;margin-top:2px;">${opts.caseNumber}</div>
        </div>
        <div>
          <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Location</span>
          <div style="font-size:14px;color:#0f172a;margin-top:2px;">${opts.address}, ${opts.city}, ${opts.state}</div>
        </div>
      </div>

      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Incendiary fires require immediate supervisory review. Please review the investigation
        findings, evidence documentation, and ensure the appropriate law enforcement agencies
        have been notified per department protocol.
      </p>

      <a href="${opts.investigationUrl}" style="
        display:inline-block;background:#1e3a8a;color:white;text-decoration:none;
        font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;
      ">View Investigation →</a>
    </div>
    <!-- Footer -->
    <div style="border-top:1px solid #f1f5f9;padding:16px 32px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        FireTrace Pro · NFPA 921 Fire Investigation Platform<br/>
        This alert was sent because your account has supervisor or admin privileges.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function pendingReviewAlertHtml(opts: {
  caseNumber: string;
  address: string;
  investigatorName: string;
  investigationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:linear-gradient(135deg,#172554 0%,#1e40af 100%);padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:8px;text-align:center;line-height:36px;font-size:18px;">📋</div>
        <span style="color:white;font-weight:700;font-size:16px;">FireTrace Pro</span>
      </div>
      <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">Case Ready for Review</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#0f172a;font-size:15px;margin:0 0 20px;">
        ${opts.investigatorName} has submitted <strong>${opts.caseNumber}</strong> for supervisory review.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">Location</span>
        <div style="font-size:14px;color:#0f172a;margin-top:2px;">${opts.address}</div>
      </div>
      <a href="${opts.investigationUrl}" style="
        display:inline-block;background:#1e3a8a;color:white;text-decoration:none;
        font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;
      ">Review Investigation →</a>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding:16px 32px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">FireTrace Pro · NFPA 921 Fire Investigation Platform</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
