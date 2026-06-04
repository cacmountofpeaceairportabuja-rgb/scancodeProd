import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFFFF] text-white pt-4 pb-4 border-t border-green-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-8">
          
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="mb-8 mt-8">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src="/image4.png"
                  alt="ScanCodes"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="font-bold mb-4 text-black">PLATFORMS</h4>
            <ul className="space-y-3 text-black">
              <li>
                <a 
                  href="https://idcode.ng" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  idcode.ng
                </a>
              </li>
              <li>
                <a 
                  href="https://scancodes.ng" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  scancodes.ng
                </a>
              </li>
              <li>
                <a 
                  href="https://www.deallock.ng" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  deallock
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-black">COMPANY</h4>
            <ul className="space-y-3 text-black">
              <li><Link href="#" className="hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-black">LEGAL</h4>
            <ul className="space-y-3 text-black">
              <li><Link href="#" className="hover:text-green-400 transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-green-400 transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-black">CONTACT</h4>
            <div className="flex gap-7">
              {/* X (Twitter) */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="black" viewBox="0 0 24 24">
                  <path d="M18.244 2.25l-7.584 7.584-3.75-3.75-4.41 4.41 4.41 4.41 7.584-7.584 3.75 3.75 4.41-4.41z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="black" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                  <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441 0 .796.645 1.441 1.441 1.441.796 0 1.441-.645 1.441-1.441 0-.796-.645-1.441-1.441-1.441z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="black" viewBox="0 0 24 24">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        

        {/*  Copyright */}
        <div className="border-t border-green-950 mt-8 pt-4 text-center text-sm text-black">
          © {currentYear} ScanCodes
        </div>

        
      </div>
    </footer>
  );
}