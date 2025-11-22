export const metadata = {
  title: 'Simulateur Suivi Solaire Bi-Axial',
  description: 'Simulateur 3D réaliste de système de pilotage de panneaux solaires avec suivi bi-axial du soleil',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
