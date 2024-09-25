import { Roboto } from "next/font/google";
import "../styles/styles.css"
import { ClerkProvider } from '@clerk/nextjs';
import MainNav from "@/components/MainNav";
import { Container } from "@mui/material";
import Head from "next/head";

const roboto = Roboto({
  weight: '500',
  subsets: ["latin"]
});

export const metadata = {
  title: "StudyGenie",
  description: "Turn your ideas into index cards.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </Head>
        <body className={roboto.className}>
          <MainNav />
          <br />
          <br />
          <br />
          <Container maxWidth="lg">
            {children}
          </Container>
        </body>
      </html>
    </ClerkProvider>
  );
}
