import ClientLayout from "@/components/shared/ClientLayout";

export const revalidate = 120;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
