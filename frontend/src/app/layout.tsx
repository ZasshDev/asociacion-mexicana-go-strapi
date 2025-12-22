import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // <--- Importamos el cerebro de la sesión
import Navbar from "@/components/Navbar"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asociación Mexicana de Go",
  description: "Sitio oficial de la AMGo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Envolvemos TODO con AuthProvider para que Navbar y las páginas accedan al usuario */}
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}