import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "MetaBattles",
  description: "MetaBattles",
  icons: {
    icon: "https://gold-imperial-tuna-683.mypinata.cloud/ipfs/bafybeiduthswcljjfzcjosgbghnrwhblbeiyypi6adtonjaltjcc33yyxq", // Make sure to add your favicon in the public folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${pixelFont.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
