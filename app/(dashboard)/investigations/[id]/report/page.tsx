import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { ReportBuilder } from "@/components/reports/ReportBuilder";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;

  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      investigator: true,
      evidence: { include: { chainOfCustody: true } },
      firePatterns: true,
      insuranceClaim: true,
    },
  });

  if (!investigation) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`Report — ${investigation.caseNumber}`}
        subtitle="NFPA 921 Investigation Report Builder"
      />
      <div className="flex-1 overflow-hidden">
        <ReportBuilder investigation={investigation} />
      </div>
    </div>
  );
}
