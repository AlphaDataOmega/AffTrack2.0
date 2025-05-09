import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  CircleDollarSign,
  Users,
  LineChart,
  Rocket,
  Star,
  Quote,
  Workflow,
  Globe,
  Gauge,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0a0f1a]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0f1a]/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">AffTrack</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="text-sm text-gray-300 hover:text-blue-400 transition-colors">
                Documentation
              </Link>
              <Button size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20 px-4 py-1">
                <Github className="h-3.5 w-3.5 mr-2" />
                Open Source
              </Badge>
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Next-Gen <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Affiliate</span> Analytics
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                A powerful, self-hosted platform for tracking affiliate campaigns, managing leads, and optimizing your revenue. Free and open source forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25" asChild>
                  <Link href="/auth/register">
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10" asChild>
                  <Link href="https://github.com/yourusername/afftrack">
                    <Github className="mr-2 h-5 w-5" />
                    Star on GitHub
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500/30 blur-3xl rounded-full"></div>
              <div className="relative bg-[#151b2e] border border-white/10 rounded-lg shadow-2xl p-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-4 bg-[#0a0f1a] rounded-lg border border-white/5">
                    <CircleDollarSign className="h-10 w-10 text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-400">Total Earnings</p>
                      <p className="text-2xl font-bold text-white">$12,345.67</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-[#0a0f1a] rounded-lg border border-white/5">
                      <Users className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-400">Referrals</p>
                        <p className="text-xl font-bold text-white">142</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#0a0f1a] rounded-lg border border-white/5">
                      <LineChart className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-400">Conversion</p>
                        <p className="text-xl font-bold text-white">24.8%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-[#151b2e]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20 px-4 py-1">
              <Rocket className="h-3.5 w-3.5 mr-2" />
              Features
            </Badge>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              Why Choose AffTrack?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage and scale your affiliate business, completely free and open source
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Gauge,
                title: "Real-Time Analytics",
                description: "Monitor performance metrics instantly with our powerful dashboard. Make data-driven decisions faster."
              },
              {
                icon: Workflow,
                title: "Automated Workflows",
                description: "Streamline your operations with automated lead distribution and tracking systems."
              },
              {
                icon: Globe,
                title: "Self Hosted",
                description: "Host on your own infrastructure. Full control over your data and customizations."
              }
            ].map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg bg-[#0a0f1a] border border-white/10 p-6 transition-all hover:border-blue-400/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-blue-400/10"></div>
                <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0a0f1a]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-blue-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join our open source community and start tracking your affiliate campaigns today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25" asChild>
                <Link href="/auth/register">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10" asChild>
                <Link href="https://github.com/yourusername/afftrack">
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0f1a]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold">AffTrack</span>
            </Link>
            <p className="text-sm text-gray-400">
              © 2024 AffTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}