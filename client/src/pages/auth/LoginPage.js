import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Users,
  Briefcase,
  Shield,
  ArrowRight,
  Info,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Globe,
} from 'lucide-react';

const LoginPage = () => {
  return (
    <div
      className="min-h-screen relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.3),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-slate-950/10">
              <Award className="h-7 w-7 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-100/80">
                SARDAR PATEL UNIVERSITY
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-black/10 ring-1 ring-white/10 transition hover:bg-slate-800"
            >
              <Info className="h-4 w-4" />
              About Portal
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-black/10 ring-1 ring-white/10 transition hover:bg-slate-800"
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
            </button>
          </div>
        </header>

        <main className="mt-16 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-200/70">Welcome to</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Alumni <span className="text-yellow-300">Portal</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200/85 sm:text-lg">
            Connect with your alumni network and explore opportunities with a modern, interactive login experience.
          </p>
        </main>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          <Link
            to="/login/student"
            className="group overflow-hidden rounded-[28px] bg-white/95 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 mx-auto mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Student Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Access alumni directory, job opportunities, MOUs, and notifications.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" /> Browse Alumni Directory
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" /> View Job Opportunities
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" /> Access MOUs & Resources
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between text-blue-600">
              <span className="text-sm font-medium">Login as Student</span>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/login/alumni"
            className="group overflow-hidden rounded-[28px] bg-white/95 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 mx-auto mb-6">
              <Briefcase className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Alumni Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Connect with students, post jobs, view MOUs, and manage messages.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Network with Students
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Post & Manage Jobs
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Stay Updated
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between text-emerald-700">
              <span className="text-sm font-medium">Login as Alumni</span>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/login/admin"
            className="group overflow-hidden rounded-[28px] bg-white/95 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 mx-auto mb-6">
              <Shield className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Admin Login</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Manage users, content, analytics, and system administration.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" /> User Management
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" /> Content & Analytics
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" /> Security & Settings
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between text-violet-700">
              <span className="text-sm font-medium">Login as Admin</span>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </section>

        

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-slate-900/80 p-5 text-white shadow-xl shadow-black/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Network Building</h3>
            <p className="mt-2 text-sm text-slate-300">Connect with alumni and students worldwide.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-5 text-white shadow-xl shadow-black/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Career Opportunities</h3>
            <p className="mt-2 text-sm text-slate-300">Find and post job opportunities easily.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-5 text-white shadow-xl shadow-black/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Knowledge Sharing</h3>
            <p className="mt-2 text-sm text-slate-300">Share knowledge and stay updated.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-5 text-white shadow-xl shadow-black/10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">University Partnerships</h3>
            <p className="mt-2 text-sm text-slate-300">Access MOUs and collaborations.</p>
          </div>
        </section>

        
      </div>
    </div>
  );
};

export default LoginPage;
