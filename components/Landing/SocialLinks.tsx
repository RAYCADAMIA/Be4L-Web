export function SocialLinks() {
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://instagram.com/be4l.app',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/be4l_app',
      icon: '𝕏',
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@be4l.app',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.321 5.562a5.122 5.122 0 0 1-.868-.462 6.582 6.582 0 0 1-1.477-1.195c-.428-.47-.768-1.133-.768-1.905V0h-3.717v13.713c0 1.12-.898 2.023-2.018 2.023-1.12 0-2.018-.902-2.018-2.023 0-1.12.898-2.022 2.018-2.022.257 0 .504.054.738.15v-3.88a6.555 6.555 0 0 0-.738-.042C7.583 6.74 4.5 9.787 4.5 13.62c0 3.833 3.083 6.88 6.88 6.88 3.833 0 6.88-3.047 6.88-6.88V9.31c1.405.968 3.084 1.549 4.906 1.549v-3.797c-1.298 0-2.504-.406-3.545-1.1z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex gap-6 justify-center items-center">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="text-gray-500 hover:text-transparent hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-cyan-400 hover:bg-clip-text transition-colors duration-150 transform hover:scale-110"
        >
          {typeof link.icon === 'string' ? (
            <span className="text-2xl">{link.icon}</span>
          ) : (
            <div className="w-6 h-6">{link.icon}</div>
          )}
        </a>
      ))}
    </div>
  )
}
