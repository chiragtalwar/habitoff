import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/freepik__auto-expand-please__89345.jpeg')`,
          filter: 'brightness(0.9)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-lg mx-auto text-center px-4"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <h1 className="text-[6.5rem] font-thin tracking-[0.25em] text-transparent bg-clip-text
            bg-gradient-to-r from-[#e4e4e7] via-[#fafafa] to-[#e4e4e7] uppercase">
            Habito
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 mb-12"
        >
          <p className="text-2xl font-medium bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent drop-shadow-lg leading-relaxed tracking-wide">
            Transform your daily actions into lasting change.
          </p>
          <p className="text-lg font-medium bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent drop-shadow-lg leading-relaxed tracking-wide">
            Your personal garden of mindful habits awaits. Each click plants a seed of positive change.
          </p>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={signIn}
          className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm
            border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl
            transition-all duration-300 transform hover:scale-[1.02]"
        >
          <span className="relative z-10 text-lg font-medium">Plant Your First Habit</span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 rounded-lg
            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>

      </motion.div>
    </div>
  );
} 