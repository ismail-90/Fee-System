import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '../providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fee Management System',
  description: 'School Fee Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position='top-right' />
          <QueryProvider>
            {children}
            </QueryProvider>
           
        </AuthProvider>
      </body>
    </html>
  );
}