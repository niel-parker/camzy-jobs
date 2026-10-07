'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Users, UserPlus, Shield, Check, Trash2, Mail, Crown } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'RECRUITER';
  status: 'ACTIVE' | 'INVITED';
  addedDate: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@techcorp.com',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    addedDate: 'Aug 12, 2026',
  },
  {
    id: 'usr-2',
    name: 'David Miller',
    email: 'david.m@techcorp.com',
    role: 'RECRUITER',
    status: 'ACTIVE',
    addedDate: 'Sep 01, 2026',
  },
  {
    id: 'usr-3',
    name: 'Emily Watson',
    email: 'emily.watson@techcorp.com',
    role: 'RECRUITER',
    status: 'INVITED',
    addedDate: 'Oct 04, 2026',
  },
];

export default function RecruiterSeatsPage() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'COMPANY_ADMIN' | 'RECRUITER'>('RECRUITER');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const maxSeats = 10;
  const usedSeats = team.length;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
      addedDate: 'Just now',
    };

    setTeam([...team, newMember]);
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const removeMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight theme-text">
            Recruiter Team Seats Management
          </h1>
          <p className="mt-1 text-xs theme-muted">
            Invite recruiter team members and manage seat allocation limits under your company plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Team List & Seat Gauge */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seat Quota Usage Card */}
            <div className="p-6 rounded-xl border theme-border theme-surface space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-bold theme-text">Subscription Seat Quota</h3>
                </div>
                <span className="text-sm font-extrabold text-indigo-500">
                  {usedSeats} / {maxSeats} Seats Used
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(usedSeats / maxSeats) * 100}%` }}
                />
              </div>
              <p className="text-xs theme-muted">
                Professional Plan allows up to {maxSeats} recruiter seats. Upgrade plan for additional seats.
              </p>
            </div>

            {/* Team Members Directory */}
            <div className="theme-surface border theme-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold theme-text uppercase tracking-wider">
                Active Team Members ({team.length})
              </div>
              <div className="divide-y theme-border">
                {team.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-600/10 text-indigo-600 font-bold flex items-center justify-center text-sm uppercase">
                        {member.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm theme-text">{member.name}</span>
                          {member.role === 'COMPANY_ADMIN' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400">
                              <Crown className="h-3 w-3 mr-0.5" /> Admin
                            </span>
                          )}
                        </div>
                        <span className="text-xs theme-muted">{member.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {member.status}
                      </span>
                      {member.role !== 'COMPANY_ADMIN' && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-all"
                          title="Revoke Seat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Invite Form */}
          <div>
            <div className="p-6 rounded-xl border theme-border theme-surface space-y-4">
              <h3 className="text-lg font-bold theme-text flex items-center">
                <UserPlus className="h-5 w-5 text-indigo-500 mr-2" /> Invite Team Recruiter
              </h3>

              {inviteSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center">
                  <Check className="h-4 w-4 mr-1.5" /> Invitation sent successfully!
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Recruiter Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@techcorp.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">
                    Role Permission
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="RECRUITER">Recruiter (Manage Jobs & Candidates)</option>
                    <option value="COMPANY_ADMIN">Company Admin (Full Billing & Seat Controls)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  <span>Send Seat Invitation</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
