export function SocialLinks() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/be4l.app', icon: '📸' },
    { name: 'Twitter', url: 'https://twitter.com/be4l_app', icon: '𝕏' },
    { name: 'TikTok', url: 'https://tiktok.com/@be4l.app', icon: '🎵' },
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
          <span className="text-2xl">{link.icon}</span>
        </a>
      ))}
    </div>
  )
}
