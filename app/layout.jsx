import "@fontsource/press-start-2p";
import "./globals.css";

export const metadata = {
  title: "Kalender Musim",
  description: "Kalender musim dan cuaca dengan gaya pixel."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
