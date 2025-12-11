import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import finanzaLogo from "@/assets/finanza-logo-welcome.png";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
      return;
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading || user) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const timer = setTimeout(() => {
      navigate("/auth");
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate, loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 30% 20%, #10b981 0%, transparent 40%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(circle at 70% 80%, #0ea5e9 0%, transparent 40%)",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/40"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "20%", left: "10%" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-teal-500/10 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ bottom: "30%", right: "15%" }}
      />

      {/* Main content */}
      <div className="z-10 flex flex-col items-center px-6 text-center">
        {/* Logo animation with glow */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.8,
          }}
          className="mb-8 relative"
        >
          {/* Logo glow effect */}
          <motion.div
            className="absolute inset-0 bg-emerald-400/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src={finanzaLogo}
            alt="Finanza Logo"
            className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl relative z-10"
            animate={{
              y: [0, -10, 0],
              rotateY: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* App name with sparkle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center gap-2 mb-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
              Finanza
            </span>
          </h1>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-teal-400" />
          </motion.div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-2 mb-8"
        >
          <p className="text-xl md:text-2xl text-gray-300">
            Bem-vindo ao seu
          </p>
          <motion.p 
            className="text-lg md:text-xl text-emerald-400 font-medium"
            animate={{
              textShadow: [
                "0 0 10px rgba(16, 185, 129, 0.5)",
                "0 0 20px rgba(16, 185, 129, 0.8)",
                "0 0 10px rgba(16, 185, 129, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Controle Financeiro Pessoal
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-gray-400 text-sm md:text-base max-w-xs mb-8"
        >
          Organize suas finanças de forma simples, visual e inteligente
        </motion.p>

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 group"
          >
            <span>Entrar</span>
            <motion.div
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.4 }}
          className="w-48 md:w-64 mt-8"
        >
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full bg-[length:200%_auto]"
              style={{ width: `${progress}%` }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 0%"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Redirecionando em {Math.ceil((100 - progress) / 20)}s...
          </p>
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(to top, rgba(16, 185, 129, 0.15), transparent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      />
      
      {/* Corner decorations */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 border border-emerald-500/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-16 h-16 border border-teal-500/20 rounded-lg"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default Welcome;
