import { PublicDetail } from "@/components/public-pages";
import { demoTournaments } from "@/components/demo-data";
export function generateStaticParams() {
  return demoTournaments.map((x) => ({ slug: x.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = demoTournaments.find((x) => x.id === slug);
  return {
    title: item?.name || "ForeCircle",
    description: "Explore this sample ForeCircle tournament.",
    robots: { index: false, follow: false },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicDetail kind="tournament" id={slug} />;
}
