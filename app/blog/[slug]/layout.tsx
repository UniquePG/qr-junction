import Footer from "@/components/Footer";


export default function BlogPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  {children}
  <Footer />
  </>;
}

