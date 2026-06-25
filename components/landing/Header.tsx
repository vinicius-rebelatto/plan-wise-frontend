"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import localFont from 'next/font/local';

// Ajuste o caminho src conforme o local exato do seu arquivo de fonte
const nourd = localFont({
  src: '../../fonts/nourd_regular.ttf',
  weight: '400',
});

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "py-3 bg-surface-bg/80 backdrop-blur-md border-b border-surface-border shadow-sm" 
          : "py-6 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/icon.png"
            alt="Plan Wise Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className={`text-xl text-text-primary tracking-tight ${nourd.className}`}>
            Plan Wise
          </span>
        </Link>

        {/* Navegação Principal */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link 
            href="/#sobre" 
            onClick={(e) => handleNavClick(e, "sobre")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-base cursor-pointer"
          >
            Sobre
          </Link>
          <Link 
            href="/#produto" 
            onClick={(e) => handleNavClick(e, "produto")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-base cursor-pointer"
          >
            Produto
          </Link>
          <Link 
            href="/#solucao" 
            onClick={(e) => handleNavClick(e, "solucao")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-base cursor-pointer"
          >
            Solução
          </Link>
          <Link 
            href="/#pricing" 
            onClick={(e) => handleNavClick(e, "pricing")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-base cursor-pointer"
          >
            Pricing
          </Link>
        </nav>

        {/* Ações (Login / Registro) */}
        <div className="flex items-center gap-4">
          <Link 
            href="/auth?mode=login" 
            className="hidden text-sm font-medium text-text-primary transition-colors hover:text-brand-base md:block"
          >
            Login
          </Link>
          <Link 
            href="/auth?mode=register" 
            className="rounded-md bg-brand-base px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-light"
          >
            Começar Grátis
          </Link>
        </div>

      </div>
    </header>
  );
}