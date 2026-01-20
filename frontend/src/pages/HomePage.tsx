import { useNavigate } from "react-router-dom";
import { Bus, Users, MapPin, CreditCard, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import Beams from "../components/Beams";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bus,
      title: "Gestion des Lignes",
      description: "Créez et gérez vos lignes de bus en temps réel"
    },
    {
      icon: Users,
      title: "Chauffeurs",
      description: "Supervisez votre équipe de conducteurs"
    },
    {
      icon: MapPin,
      title: "Stations",
      description: "Organisez votre réseau de stations"
    },
    {
      icon: CreditCard,
      title: "Abonnements",
      description: "Gérez les abonnements clients facilement"
    },
    {
      icon: AlertTriangle,
      title: "Incidents",
      description: "Suivez et résolvez les incidents rapidement"
    },
    {
      icon: CheckCircle,
      title: "Rapports",
      description: "Analysez vos performances en détail"
    }
  ];

  return (
    <div className="relative text-white o bg-slate-950">
      {/* Beams Background - Version CSS simple */}
      import Beams from './Beams';

    <div className="fixed inset-0 w-screen h-screen" style={{ margin: 0, padding: 0 }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          <Beams
            beamWidth={3}
            beamHeight={20}
            beamNumber={12}
            lightColor="#ffffff"
            speed={1.5}
            noiseIntensity={2}
            scale={0.2}
            rotation={30}
          />
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/50"></div>

      {/* Header */}
      <nav className="relative px-6 py-6 z-5 md:px-24">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <Bus className="w-8 h-8" />
            </div>
            <span
  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500"
  style={{
    textShadow:
      '0 0 10px rgba(180, 180, 180, 0.6), 0 0 20px rgba(220, 220, 220, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)',
  }}
>
  BusManager
</span>

          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-300 border border-white/20"
            >
              <span>Connexion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/sign-up")}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 rounded-xl transition-all duration-300 border border-blue-300/40 text-blue-100"
            >
              <span>Créer un compte</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 space-y-10 text-center">
            <h1 className="text-5xl font-bold leading-tight md:text-7xl">
              <span className="block">Gestion de Transport</span>
                          <span
              className="block text-transparent bg-gradient-to-r from-gray-500 via-gray-600 to-white bg-clip-text shiny-text"
              style={{
                textShadow:
                  '0 0 20px rgba(160, 160, 160, 0.5), 0 0 40px rgba(200, 200, 200, 0.3)',
              }}
            >
              Simplifiée et Moderne
            </span>

            </h1>
            <p className="max-w-3xl mx-auto text-base leading-relaxed text-white md:text-xl font=[poppins]">
              Une plateforme complète pour gérer vos lignes de bus, chauffeurs, stations, 
              abonnements et incidents. Interface intuitive, données en temps réel, 
              et contrôle total de votre réseau de transport.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center px-8 py-4 space-x-2 text-lg font-semibold text-center transition-all duration-300 shadow-2xl text-relative group bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl hover:shadow-blue-200/50 hover:scale-105"
              >
                <span className="font-bold text-center text-gray-800">Accéder au Dashboard</span>
                <ArrowRight className="h-5 text-gray-600 transition-transform blaw-5 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/sign-up")}
                className="px-8 py-4 text-lg font-semibold transition-all duration-300 border bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl border-white/20"
              >
                Créer un compte
              </button>
              <button className="px-8 py-4 text-lg font-semibold transition-all duration-300 border bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl border-white/20">
                En savoir plus
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 mt-20 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="relative p-6 transition-all duration-300 border group bg-white/5 backdrop-blur-sm rounded-2xl border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl group-hover:opacity-100"></div>
                  <div className="relative">
                    <div className="pb-6">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-blue-200">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-6 mt-20 md:grid-cols-4">
            {[
              { value: "99.9%", label: "Disponibilité" },
              { value: "24/7", label: "Support" },
              { value: "500+", label: "Entreprises" },
              { value: "50K+", label: "Utilisateurs" }
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 text-center border bg-white/5 backdrop-blur-sm rounded-2xl border-white/10"
              >
                <div className="mb-2 text-3xl font-bold text-transparent md:text-4xl bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200 md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 mt-20 border-t border-white/10">
        <div className="mx-auto text-center text-blue-200 max-w-7xl">
          <p>© 2024 BusManager. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}