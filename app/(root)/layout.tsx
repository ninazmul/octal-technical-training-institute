import ClientLayout from "@/components/shared/ClientLayout";

export const revalidate = 60;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
