import React, { useState } from 'react'
import { AnimatedOrbs } from './AnimatedOrbs'
import { SocialLinks } from './SocialLinks'
import { addLandingPageEmail } from '../../services/supabaseService'

export function LaunchLanding() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim()) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }

    const result = await addLandingPageEmail(email)

    if (result.success) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 5000)
    } else {
      setError(result.error || 'Failed to save email. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background */}
      <AnimatedOrbs />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Logo */}
        <h1 className="hero-content text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          Be4L
        </h1>

        {/* Primary tagline */}
        <h2 className="hero-content-stagger-1 text-4xl md:text-5xl font-bold text-white mb-6">
          Chase the lore
        </h2>

        {/* Subtext */}
        <p className="hero-content-stagger-2 text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
          Conquer Side Quests. Collect Lores To Tell. Discover Experiences
        </p>

        {/* Email signup form */}
        <form onSubmit={handleSubmit} className="hero-content-stagger-3 mb-12">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="px-6 py-4 rounded-lg bg-purple-900/20 border-2 border-purple-500 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Saving...' : 'Notify Me'}
            </button>
          </div>

          {/* Status messages */}
          {submitted && (
            <p className="mt-4 text-cyan-400 text-sm animate-pulse">
              ✓ Thanks! We'll let you know when we launch.
            </p>
          )}
          {error && (
            <p className="mt-4 text-red-400 text-sm">
              {error}
            </p>
          )}
        </form>

        {/* Launch message */}
        <p className="hero-content-stagger-3 text-purple-400 text-sm animate-pulse">
          Launching on a random tuesday
        </p>
      </div>

      {/* Footer with social links */}
      <div className="absolute bottom-8 w-full flex flex-col items-center gap-6">
        <SocialLinks />
        <p className="text-gray-600 text-xs">© 2026 Be4L</p>
      </div>
    </div>
  )
}
