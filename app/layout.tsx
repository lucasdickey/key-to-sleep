import "./globals.css";

export const metadata = {
  title: "Key To Sleep - Custom Sleep Stories",
  description:
    "Create personalized bedtime stories crafted just for your child",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
