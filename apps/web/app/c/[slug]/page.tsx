import { PublicDetail } from "@/components/public-pages";
import { demoCircles } from "@/components/demo-data";
export function generateStaticParams() {
  return demoCircles.map((x) => ({ slug: x.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = demoCircles.find((x) => x.id === slug);
  return {
    title: item?.name || "ForeCircle",
    description: "Explore this sample ForeCircle circle.",
    robots: { index: false, follow: false },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicDetail kind="circle" id={slug} />;
}
