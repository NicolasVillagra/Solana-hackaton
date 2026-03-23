"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConnectedProjectCard } from "@/components/cards/ConnectedProjectCard";
import { EnergyCard } from "@/components/cards/EnergyCard";
import { TokenCard } from "@/components/cards/TokenCard";
import { ProjectsMapSection } from "@/components/sections/ProjectsMapSection";
import { DeviceInfo } from "@/components/sections/DeviceInfo";
import { SolanaIntegration } from "@/components/sections/SolanaIntegration";
import { Sparkles, TrendingUp, Users, Plus, Cpu } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useWallet } from "@solana/wallet-adapter-react";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


interface Node {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  glow: string;
}

interface Packet {
  id: number;
  segment: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
}

interface Stats {
  kwh: number;
  co2: number;
  tokens: number;
  txs: number;
}

const NODES: Node[] = [
  {
    id: "solar",
    label: "Solar Farm",
    sublabel: "Growatt / Hoymiles",
    icon: "☀️",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.4)",
  },
  {
    id: "iot",
    label: "IoT Edge",
    sublabel: "MQTT · TLS 1.3",
    icon: "📡",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.4)",
  },
  {
    id: "api",
    label: "Gaia API",
    sublabel: "Node.js · Express",
    icon: "⚡",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.4)",
  },
  {
    id: "solana",
    label: "Solana",
    sublabel: "Devnet · ~400ms",
    icon: "◎",
    color: "#14f195",
    glow: "rgba(20,241,149,0.5)",
  },
];

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function generateHash(): string {
  const chars = "0123456789abcdef";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}



function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-[#e5e0d8]"
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm text-[#6b6b6b]">{label}:</span>
      <span className="text-sm font-semibold text-[#1a1a1a]">{value}</span>
    </motion.div>
  );
}

export default function Dashboard() {
  const { getTotalKwh, getTotalTokens, projects } = useProjects();
  const { publicKey, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: "",
    name: "",
    location: "",
    serialNumber: "",
    brand: "",
    capacityKw: "",
    secret: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!connected || !publicKey) {
      setSubmitError("Conecta tu wallet para registrar un dispositivo");
      return;
    }

    if (!formData.deviceId || !formData.name || !formData.location || 
        !formData.serialNumber || !formData.brand || !formData.capacityKw || !formData.secret) {
      setSubmitError("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerWallet: publicKey.toBase58(),
          deviceId: formData.deviceId,
          name: formData.name,
          location: formData.location,
          serialNumber: formData.serialNumber,
          brand: formData.brand,
          capacityKw: parseFloat(formData.capacityKw),
          secret: formData.secret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar dispositivo");
      }

      setSubmitSuccess(true);
      setFormData({
        deviceId: "",
        name: "",
        location: "",
        serialNumber: "",
        brand: "",
        capacityKw: "",
        secret: "",
      });
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al registrar dispositivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [packets, setPackets] = useState<Packet[]>([]);
  const [stats, setStats] = useState<Stats>({ kwh: 1847.3, co2: 738.9, tokens: 1847, txs: 312 });
  const [latestTx, setLatestTx] = useState<string>(generateHash());
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [pulseNode, setPulseNode] = useState<string | null>(null);
  const packetRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = packetRef.current++;
      setPackets((prev) => [
        ...prev.slice(-12),
        {
          id,
          segment: Math.floor(randomBetween(0, 3)),
          progress: 0,
          speed: randomBetween(0.008, 0.018),
          size: randomBetween(4, 8),
          color: NODES[Math.floor(randomBetween(0, 4))].color,
        },
      ]);
    }, 350);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed }))
          .filter((p) => p.progress < 1)
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((s) => ({
        kwh: +(s.kwh + randomBetween(0.1, 0.8)).toFixed(1),
        co2: +(s.co2 + randomBetween(0.04, 0.32)).toFixed(1),
        tokens: s.tokens + (Math.random() > 0.5 ? 1 : 0),
        txs: s.txs + 1,
      }));
      if (Math.random() > 0.6) {
        setLatestTx(generateHash());
        setPulseNode("solana");
        setTimeout(() => setPulseNode(null), 600);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, []);


  return (
    
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-2">
                Dashboard de Energía
              </h1>
              <p className="text-[#6b6b6b]">
                Monitorea tu generación de energía renovable y activos tokenizados en tiempo real
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <StatBadge
                icon={TrendingUp}
                label="Total kWh"
                value={getTotalKwh().toLocaleString()}
                color="bg-[#F49136]"
              />
              <StatBadge
                icon={Sparkles}
                label="Tokens"
                value={`${getTotalTokens().toLocaleString()} GAI`}
                color="bg-[#066EB5]"
              />
              <StatBadge
                icon={Users}
                label="Proyectos"
                value={`${projects.length} Activos`}
                color="bg-[#904907]"
              />
            </div>
          </div>
        </motion.div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-end pb-5 ">
                  <Button className="bg-[#F49136] hover:bg-[#e07d20] text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-orange-200 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Device
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#066EB5]" />
                    Registrar Nuevo Dispositivo
                  </DialogTitle>
                  <DialogDescription>
                    Completa el formulario para registrar un nuevo dispositivo de energía en la red Gaia.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1a1a1a]">ID del Dispositivo</label>
                      <Input
                        name="deviceId"
                        placeholder="SOLAR-001"
                        value={formData.deviceId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1a1a1a]">Nombre</label>
                      <Input
                        name="name"
                        placeholder="Panel Solar Principal"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">Ubicación</label>
                    <Input
                      name="location"
                      placeholder="Bogotá, Colombia"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1a1a1a]">Número de Serie</label>
                      <Input
                        name="serialNumber"
                        placeholder="SN-2024-001"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1a1a1a]">Marca</label>
                      <Input
                        name="brand"
                        placeholder="SunPower"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">Capacidad (kW)</label>
                    <Input
                      name="capacityKw"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="5.5"
                      value={formData.capacityKw}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1a1a1a]">Clave Secreta del Dispositivo</label>
                    <Input
                      name="secret"
                      type="password"
                      placeholder="••••••••••"
                      value={formData.secret}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                      ¡Dispositivo registrado exitosamente!
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#066EB5] hover:bg-[#055a9a] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        "Registrar Dispositivo"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConnectedProjectCard />
          <EnergyCard />
          <TokenCard />
        </div>

        <div
          style={{
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            background: "linear-gradient(135deg, #fdfcfa 30%, #f6ece0 80%)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: "16px",
            padding: "24px",
            width: "100%",
            boxShadow: "0 0 40px rgba(20,241,149,0.06), 0 0 80px rgba(167,139,250,0.06)",
            color: "#e2e8f0",
            position: "relative",
            overflow: "hidden",
            margin: "30px auto",
          }}
        >
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "45px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#14f195", boxShadow: "0 0 8px #14f195", animation: "blink 1.4s infinite" }} />
                <span style={{ fontSize: "14px", color: "#14f195", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live Pipeline</span>
              </div>
              <h3 style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 600, color: "#f8fafc", letterSpacing: "0.02em" }}>
                IoT → Solana Data Flow
              </h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.08em" }}>NETWORK</div>
              <div style={{ fontSize: "14px", color: "#a78bfa", fontWeight: 600 }}>Solana Devnet</div>
            </div>
          </div>

          <div ref={containerRef} style={{ position: "relative", height: "100px", marginBottom: "20px"}}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                {NODES.map((n) => (
                  <filter key={n.id} id={`glow-${n.id}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="33%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="66%" stopColor="#a78bfa" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#14f195" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {[0, 1, 2].map((i) => {
                const x1 = `${12.5 + i * 25}%`;
                const x2 = `${37.5 + i * 25}%`;
                return (
                  <line key={i} x1={x1} y1="50%" x2={x2} y2="50%"
                    stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4"
                    style={{ opacity: 0.6 }}
                  />
                );
              })}

              {packets.map((p) => {
                const segStart = 12.5 + p.segment * 25;
                const segEnd = 37.5 + p.segment * 25;
                const cx = `${segStart + (segEnd - segStart) * p.progress}%`;
                return (
                  <circle key={p.id} cx={cx} cy="50%" r={p.size / 2}
                    fill={p.color} opacity={0.9 - p.progress * 0.3}
                    filter={`url(#glow-${NODES[p.segment].id})`}
                  />
                );
              })}
            </svg>

            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "100%", position: "relative", zIndex: 1, }}>
              {NODES.map((node) => (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "6px", cursor: "default", transition: "transform 0.2s",
                    transform: activeNode === node.id ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <div style={{
                    width: "110px", height: "110px", borderRadius: "12px",
                    background: `rgba(0,0,0,0.6)`,
                    border: `1.5px solid ${pulseNode === node.id ? node.color : node.color + "55"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "30px",
                    boxShadow: pulseNode === node.id
                      ? `0 0 20px ${node.glow}, 0 0 40px ${node.glow}`
                      : activeNode === node.id
                      ? `0 0 14px ${node.glow}`
                      : `0 0 6px ${node.glow}`,
                    transition: "box-shadow 0.3s",
                  }}>
                    {node.icon}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: node.color, letterSpacing: ".05em" }}>{node.label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{node.sublabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px",
          }}>
            {[
              { label: "kWh Today", value: stats.kwh.toLocaleString(), color: "#f59e0b", unit: "" },
              { label: "CO₂ Offset", value: stats.co2.toLocaleString(), color: "#34d399", unit: "kg" },
              { label: "GAIA-E", value: stats.tokens.toLocaleString(), color: "#a78bfa", unit: "tkns" },
              { label: "Tx Count", value: stats.txs.toLocaleString(), color: "#14f195", unit: "" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.06)", padding: "10px 8px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>
                  {s.value}<span style={{ fontSize: "10px", marginLeft: "2px", opacity: 0.7 }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(20,241,149,0.04)", borderRadius: "8px",
            border: "1px solid rgba(20,241,149,0.15)", padding: "10px 12px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#14f195", flexShrink: 0, boxShadow: "0 0 6px #14f195" }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.1em", marginBottom: "2px" }}>LATEST TX HASH</div>
              <div style={{
                fontSize: "14px", color: "#14f195", fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}>
                {latestTx}
              </div>
            </div>
            <div style={{
              fontSize: "10px", color: "#a78bfa", background: "rgba(167,139,250,0.1)",
              borderRadius: "4px", padding: "2px 6px", flexShrink: 0,
              border: "1px solid rgba(167,139,250,0.2)",
            }}>
              CONFIRMED
            </div>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>

        {/* Projects Map Section */}
        <ProjectsMapSection />

        {/* Device Info Section */}
        <DeviceInfo />

        {/* Solana Integration Section */}
        <SolanaIntegration />

        {/* Network Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-[#F49136] via-[#F6B07D] to-[#066EB5] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🇨🇴</span>
              </div>
              <div className="text-white">
                <h3 className="text-lg font-semibold">SOLENERGY</h3>
                <p className="text-white/80 text-sm">Métricas de blockchain en tiempo real</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="text-center">
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-white/70">Validadores</p>
              </div>
              <div className="w-px h-10 bg-white/20 hidden md:block" />
              <div className="text-center">
                <p className="text-2xl font-bold">{getTotalKwh().toLocaleString()}</p>
                <p className="text-xs text-white/70">Total kWh</p>
              </div>
              <div className="w-px h-10 bg-white/20 hidden md:block" />
              <div className="text-center">
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-white/70">Proyectos</p>
              </div>
              <div className="w-px h-10 bg-white/20 hidden md:block" />
              <div className="text-center">
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-xs text-white/70">Uptime</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}