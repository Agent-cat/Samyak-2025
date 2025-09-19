import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src="/img/samyak.svg" alt="Samyak" className="h-8 w-8" />
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} Samyak. All rights reserved.
            </p>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <a
              href="/"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Home
            </a>
            <a
              href="/events"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Events
            </a>
            <a
              href="/gallery"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Gallery
            </a>
            <a
              href="/team"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Team
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-300">Developed by</span>
              <a
                href="https://www.linkedin.com/in/vishnu-vardhan-a8a5b92a1/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white transition-colors hover:border-white/20"
              >
                <LinkedInIcon />
                <span className="group-hover:text-red-500">Vishnu</span>
                <span className="text-xs text-gray-400">/in/vishnuvardhan</span>
              </a>
              <a
                href="https://www.linkedin.com/in/jyothika-vallurupalli-962665247/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white transition-colors hover:border-white/20"
              >
                <LinkedInIcon />
                <span className="group-hover:text-red-500">Jyothika</span>
                <span className="text-xs text-gray-400">/in/Jyothika</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-white"
    aria-hidden="true"
  >
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0V8zm7.5 0H12v2.2h.06c.62-1.18 2.14-2.43 4.41-2.43 4.72 0 5.59 3.11 5.59 7.15V24h-5v-7.1c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.74V24h-5V8z" />
  </svg>
);

export default Footer;
