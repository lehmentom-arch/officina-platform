import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Officina.ch — Karriereplattform für Apotheken",
  description: "Stellen für Apotheker:innen und Pharma-Assistent:innen in der Schweiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <Nav />
        {children}
        <footer style={{ padding: "24px 32px", fontSize: 12.5, color: "#4B5A52", textAlign: "center" }}>
          Officina.ch
        </footer>
      </body>
    </html>
  );
}
