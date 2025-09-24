'use client';

import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Wooden Café - Farm to Table Experience</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdn.tailwindcss.com" async></script>
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-coffee text-amber-700 text-2xl"></i>
              <h1 className="text-2xl font-bold text-amber-800">Wooden Café</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-amber-700 hover:text-amber-500 font-semibold">Beranda</button>
              <button onClick={() => scrollToSection('about')} className="text-amber-700 hover:text-amber-500 font-semibold">Tentang</button>
              <button onClick={() => scrollToSection('menu')} className="text-amber-700 hover:text-amber-500 font-semibold">Menu</button>
              <Link href="/staff/auth/login" className="text-amber-700 hover:text-amber-500 font-semibold">Staff Login</Link>
              <button onClick={() => scrollToSection('contact')} className="text-amber-700 hover:text-amber-500 font-semibold">Kontak</button>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden flex-col items-center justify-center w-10 h-10 text-amber-700 hover:bg-amber-100 rounded-lg space-y-1"
            >
              <div className="w-6 h-0.5 bg-amber-700"></div>
              <div className="w-6 h-0.5 bg-amber-700"></div>
              <div className="w-6 h-0.5 bg-amber-700"></div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-amber-200">
            <div className="container mx-auto px-4 py-4">
              <button onClick={() => scrollToSection('home')} className="block py-2 text-amber-700 hover:text-amber-500 font-semibold">Beranda</button>
              <button onClick={() => scrollToSection('about')} className="block py-2 text-amber-700 hover:text-amber-500 font-semibold">Tentang</button>
              <button onClick={() => scrollToSection('menu')} className="block py-2 text-amber-700 hover:text-amber-500 font-semibold">Menu</button>
              <Link href="/staff/auth/login" className="block py-2 text-amber-700 hover:text-amber-500 font-semibold">Staff Login</Link>
              <button onClick={() => scrollToSection('contact')} className="block py-2 text-amber-700 hover:text-amber-500 font-semibold">Kontak</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
        <div className="container mx-auto px-4 text-center pt-20">
          <h2 className="text-5xl md:text-7xl text-amber-800 font-bold mb-6">
            Selamat Datang di Wooden Café
          </h2>
          <p className="text-xl md:text-2xl text-amber-700 mb-8 max-w-3xl mx-auto">
            Perpaduan unik antara restoran dan kebun organik seluas 2,4 hektar di jantung kota
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-amber-700 text-white rounded-full hover:bg-amber-800 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <i className="fas fa-calendar-alt mr-2"></i>
              Reservasi Sekarang
            </button>
            <Link href="/menu/1" className="px-8 py-4 bg-white text-amber-800 rounded-full hover:bg-amber-50 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <i className="fas fa-utensils mr-2"></i>
              Lihat Menu
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-amber-800">
                Farm to Table Excellence
              </h3>
              <div className="w-20 h-1 bg-amber-600"></div>
              <p className="text-amber-700 leading-relaxed">
                Wooden Café adalah destinasi kuliner unik yang memadukan konsep restoran dengan kebun organik. 
                Kami menanam sendiri bahan-bahan segar yang kami gunakan, memastikan setiap hidangan 
                menghadirkan cita rasa autentik dan kualitas terbaik.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-seedling text-amber-500 text-2xl"></i>
                  <div>
                    <h4 className="font-bold text-amber-800">100% Organik</h4>
                    <p className="text-sm text-amber-600">Tanpa pestisida</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-award text-amber-500 text-2xl"></i>
                  <div>
                    <h4 className="font-bold text-amber-800">Award Winning</h4>
                    <p className="text-sm text-amber-600">James Beard Nominee</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-amber-200 rounded-3xl h-96 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-lg font-semibold">
                    &quot;Setiap hidangan adalah cerita dari kebun kami&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section id="menu" className="pt-32 pb-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-amber-800 mb-4">Menu Unggulan</h3>
            <p className="text-amber-600 max-w-2xl mx-auto">
              Nikmati hidangan istimewa yang dibuat dengan bahan-bahan segar dari kebun kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200 hover:transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-coffee text-white text-6xl opacity-50"></i>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-amber-800 mb-2">Sarapan Spesial</h4>
                <p className="text-amber-600 mb-4">
                  Mulai hari Anda dengan hidangan sarapan bergizi dari bahan organik pilihan
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-bold text-xl">Rp 45.000</span>
                  <Link href="/menu/1" className="px-4 py-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition">
                    Lihat Menu
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200 hover:transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-utensils text-white text-6xl opacity-50"></i>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-amber-800 mb-2">Lunch Sets</h4>
                <p className="text-amber-600 mb-4">
                  Paket makan siang lengkap dengan kombinasi sempurna rasa dan nutrisi
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-bold text-xl">Rp 75.000</span>
                  <Link href="/menu/1" className="px-4 py-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition">
                    Lihat Menu
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200 hover:transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-red-700 to-red-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-wine-glass text-white text-6xl opacity-50"></i>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-bold text-amber-800 mb-2">Dinner Special</h4>
                <p className="text-amber-600 mb-4">
                  Pengalaman fine dining dengan menu yang berubah sesuai musim panen
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600 font-bold text-xl">Rp 120.000</span>
                  <Link href="/menu/1" className="px-4 py-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition">
                    Lihat Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-32 pb-20 bg-amber-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6">Kunjungi Kami</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <i className="fas fa-map-marker-alt text-amber-400 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-bold mb-1">Lokasi</h4>
                    <p className="text-amber-100">
                      Jl. Kebun Raya No. 123<br />
                      Bandung, Jawa Barat 40132
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <i className="fas fa-phone text-amber-400 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-bold mb-1">Telepon</h4>
                    <p className="text-amber-100">(022) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <i className="fas fa-envelope text-amber-400 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-amber-100">hello@woodencafe.co.id</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-700 rounded-2xl p-8">
              <h4 className="text-2xl font-bold mb-6">Akses Sistem</h4>
              <div className="space-y-4">
                <Link href="/staff/auth/login" className="block w-full py-3 bg-white text-amber-800 rounded-lg font-bold hover:bg-amber-50 transition text-center">
                  <i className="fas fa-user-tie mr-2"></i>
                  Staff Login
                </Link>
                <Link href="/menu/1" className="block w-full py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-500 transition text-center">
                  <i className="fas fa-qrcode mr-2"></i>
                  Customer Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 py-8 text-center text-amber-200">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 Wooden Café. All rights reserved.</p>
          <p className="text-sm mt-2">Crafted with <i className="fas fa-heart text-red-400"></i> for food lovers</p>
        </div>
      </footer>
    </>
  );
}
