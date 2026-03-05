export const metadata = {
  title: '背书记忆',
  description: 'Agent 背书记忆 Web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
