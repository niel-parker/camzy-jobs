'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { Users, UserPlus, Shield, Check, Trash2, Mail, Crown, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'RECRUITER';
  status: 'ACTIVE' | 'INVITED' | 'PENDING_INVITE';
  addedDate?: string;
  invitedAt?: string;
}

export default function RecruiterSeatsPage() {
  const { user, sdk } = useTheme();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [maxSeats, setMaxSeats] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<'COMPANY_ADMIN' | 'RECRUITER'>('RECRUITER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const effectiveTenantId = user?.tenantId || '5c88e4d2-4e38-4e15-817b-a19fe3090e8c';

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await sdk.request<{ usedSeats: number; maxSeats: number; remainingSeats: number; members: any[] }>(
        `/tenants/seats/members?tenantId=${effectiveTenantId}`
      );
      if (res && res.members) {
        const mapped: TeamMember[] = res.members.map((m: any) => ({
          id: m.id,
          name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email.split('@')[0],
          email: m.email,
          role: m.role || 'RECRUITER',
          status: m.status || 'ACTIVE',
          addedDate: m.invitedAt ? new Date(m.invitedAt).toLocaleDateString() : 'Active Member',
        }));
        setTeam(mapped);
        if (res.maxSeats) setMaxSeats(res.maxSeats);
      }
    } catch (err) {
      console.error('Failed to load team seats members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [sdk, effectiveTenantId]);

  const usedSeats = team.length;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    if (usedSeats >= maxSeats) {
      setFeedback({
        type: 'error',
        message: `Plan seat limit reached (${usedSeats}/${maxSeats}). Please upgrade plan in Billing for more seats.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sdk.request<any>('/tenants/seats/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          firstName: inviteFirstName || inviteEmail.split('@')[0],
          lastName: inviteLastName || 'Recruiter',
          role: inviteRole,
          tenantId: effectiveTenantId,
        }),
      });

      setFeedback({
        type: 'success',
        message: res.message || `Invitation successfully sent to ${inviteEmail}!`,
      });
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      await fetchMembers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to send recruiter invitation.',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const removeMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  return (
    <DashboardLayout role="EMPLOYER">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight theme-text flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" /> Recruiter Team Seats Management
            </h1>
            <p className="mt-1 text-xs theme-muted">
              Invite recruiter team members and manage seat allocation limits under your company plan.
            </p>
          </div>

          <button
            onClick={fetchMembers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Team
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Team List & Seat Gauge */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seat Quota Usage Card */}
            <div className="p-6 rounded-2xl border theme-border theme-surface space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-black theme-text">Subscription Seat Quota</h3>
                </div>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  {usedSeats} / {maxSeats} Seats Used
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((usedSeats / (maxSeats || 1)) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs theme-muted font-medium">
                  Professional Plan allows up to {maxSeats} recruiter seats. {Math.max(0, maxSeats - usedSeats)} open seats available.
                </p>
              </div>
            </div>

            {/* Team Members Directory */}
            <div className="theme-surface border theme-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-black theme-text uppercase tracking-wider">
                <span>Active Company Team Members ({team.length})</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{Math.max(0, maxSeats - usedSeats)} seats open</span>
              </div>

              {loading ? (
                <div className="py-12 text-center theme-muted text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Loading team members from database...</span>
                </div>
              ) : team.length === 0 ? (
                <div className="py-12 text-center theme-muted text-xs">
                  No team members found. Invite your first colleague using the form on the right.
                </div>
              ) : (
                <div className="divide-y theme-border">
                  {team.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center text-sm uppercase border border-amber-500/20">
                          {member.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm theme-text">{member.name}</span>
                            {member.role === 'COMPANY_ADMIN' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                <Crown className="h-3 w-3 mr-0.5" /> Admin
                              </span>
                            )}
                          </div>
                          <span className="text-xs theme-muted">{member.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            member.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {member.status}
                        </span>
                        {member.role !== 'COMPANY_ADMIN' && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Revoke Seat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Invite Form */}
          <div>
            <div className="p-6 rounded-2xl border theme-border theme-surface space-y-4 shadow-sm">
              <h3 className="text-base font-black theme-text flex items-center">
                <UserPlus className="h-5 w-5 text-amber-500 mr-2" /> Invite Team Recruiter
              </h3>

              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {feedback.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold theme-text uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="David"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold theme-text uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Miller"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold theme-text uppercase tracking-wider mb-1">
                    Recruiter Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@techcorp.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold theme-text uppercase tracking-wider mb-1">
                    Role Permission
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border theme-border theme-surface theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="RECRUITER">Recruiter (Manage Jobs & Candidates)</option>
                    <option value="COMPANY_ADMIN">Company Admin (Full Billing & Seat Controls)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || usedSeats >= maxSeats}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
                  <span>{usedSeats >= maxSeats ? 'Seat Limit Reached' : 'Send Seat Invitation'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
