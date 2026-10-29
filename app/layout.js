
import "./globals.css";

export const metadata = {
  title: "নাথপাড়া যুবসংঘ | হিসাব ব্যবস্থাপনা",
  description: "নাথপাড়া যুবসংঘের সদস্য ও আর্থিক হিসাব ব্যবস্থাপনা",
  applicationName: "নাথপাড়া যুবসংঘ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}

