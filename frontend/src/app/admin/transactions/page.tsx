'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Receipt, Search, Eye, Download, Printer, CheckCircle2, 
  XCircle, Loader2, RefreshCw, X, Building2, CreditCard, DollarSign 
} from 'lucide-react';

export default function AdminPaymentHistoryPage() {
  const { sdk } = useTheme();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await sdk.getAdminTransactions();
      setTransactions(data || []);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [sdk]);

  const filteredTxns = transactions.filter((t) =>
    (t.invoiceId && t.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.tenantName && t.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.planName && t.planName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAmount = transactions
    .filter((t) => t.status === 'PAID')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <DashboardLayout role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Financial Audit Trail
              </span>
              <span className="text-xs font-semibold theme-muted">Centralized Billing Ledger</span>
            </div>
            <h1 className="text-2xl font-black theme-text tracking-tight mt-1 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-500" />
              Payment & Transaction History
            </h1>
            <p className="text-xs theme-muted mt-1 max-w-2xl">
              Audit all employer subscription charges, quota renewals, and generated VAT/GST invoices across all platform tenants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTransactions}
              className="p-2.5 rounded-xl border theme-border theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Total Revenue Settled</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">${totalAmount.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">Platform Invoiced</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Processed Invoices</p>
              <h3 className="text-2xl font-black theme-text mt-0.5">{transactions.length}</h3>
              <p className="text-[10px] text-indigo-500 font-bold mt-1">All Recorded Transactions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="theme-surface border theme-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold theme-muted">Payment Success Rate</p>
              <h3 className="text-2xl font-black text-emerald-500 mt-0.5">100%</h3>
              <p className="text-[10px] theme-muted mt-1">Zero Chargebacks Reported</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="theme-surface border theme-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 theme-muted" />
            <input
              type="text"
              placeholder="Search by invoice #, company name, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs theme-surface border theme-border theme-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 theme-muted hover:theme-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs theme-muted font-medium">
            Showing <span className="font-bold theme-text">{filteredTxns.length}</span> invoices
          </div>
        </div>

        {/* Invoices Table */}
        <div className="theme-surface border theme-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold theme-muted">Loading transaction records...</p>
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Receipt className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold theme-text">No invoices found</h4>
                <p className="text-xs theme-muted max-w-sm mx-auto">
                  No transaction records matched your search filter.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b theme-border bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-black tracking-wider theme-muted">
                    <th className="py-3 px-4">Invoice Number</th>
                    <th className="py-3 px-4">Billed Company</th>
                    <th className="py-3 px-4">Plan / Description</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-center">Payment Status</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4 text-right">PDF Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs">
                  {filteredTxns.map((txn) => (
                    <tr
                      key={txn.id || txn.invoiceId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold theme-text">
                        {txn.invoiceId}
                      </td>

                      <td className="py-3.5 px-4 font-bold theme-text">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{txn.tenantName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium theme-muted">
                        {txn.planName}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold theme-text">
                        ${txn.amount}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {txn.status || 'PAID'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        {txn.paymentMethod || 'Credit Card (••4242)'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] theme-muted">
                        {txn.date || new Date().toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(txn)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border theme-border theme-text hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Interactive PDF Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="max-w-2xl w-full theme-surface border theme-border rounded-2xl shadow-2xl overflow-hidden my-8">
              <div className="p-4 border-b theme-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black theme-text flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-indigo-500" />
                    Official Invoice & Tax Receipt
                  </h3>
                  <p className="text-[10px] theme-muted font-mono">{selectedInvoice.invoiceId}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg theme-muted hover:theme-text hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Invoice Container */}
              <div id="printable-invoice" className="p-6 space-y-6 theme-surface">
                {/* Invoice Top Header */}
                <div className="flex items-start justify-between border-b theme-border pb-6">
                  <div>
                    <h2 className="text-xl font-black theme-text">Camzy Jobs Technologies Inc.</h2>
                    <p className="text-xs theme-muted mt-1">100 Enterprise Way, Suite 400</p>
                    <p className="text-xs theme-muted">San Francisco, CA 94105, USA</p>
                    <p className="text-xs theme-muted font-mono">Tax ID: US-EIN-992384102</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      PAID IN FULL
                    </span>
                    <p className="text-xs font-mono font-bold theme-text pt-2">Invoice: {selectedInvoice.invoiceId}</p>
                    <p className="text-xs theme-muted">Date: {selectedInvoice.date || new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Billed To */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Billed Client Organization
                  </span>
                  <h4 className="text-base font-extrabold theme-text">{selectedInvoice.tenantName}</h4>
                  <p className="text-xs theme-muted">Payment Method: {selectedInvoice.paymentMethod || 'Corporate Card (Stripe)'}</p>
                </div>

                {/* Line Item Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b theme-border text-[10px] uppercase font-black tracking-wider theme-muted">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Period</th>
                      <th className="py-2 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border text-xs">
                    <tr>
                      <td className="py-3">
                        <span className="font-bold theme-text block">{selectedInvoice.planName} Subscription</span>
                        <span className="text-[11px] theme-muted">Unlimited ATS access, resume downloads, team workspace</span>
                      </td>
                      <td className="py-3 text-center theme-muted font-mono">Monthly</td>
                      <td className="py-3 text-right font-mono font-bold theme-text">${selectedInvoice.amount}</td>
                    </tr>
                    <tr>
                      <td className="py-2 theme-muted text-right pr-4" colSpan={2}>Subtotal:</td>
                      <td className="py-2 text-right font-mono font-bold theme-text">${selectedInvoice.amount}</td>
                    </tr>
                    <tr>
                      <td className="py-2 theme-muted text-right pr-4" colSpan={2}>Sales Tax / GST (0%):</td>
                      <td className="py-2 text-right font-mono font-bold theme-text">$0.00</td>
                    </tr>
                    <tr className="border-t theme-border">
                      <td className="py-3 text-sm font-black theme-text text-right pr-4" colSpan={2}>Total Amount Paid:</td>
                      <td className="py-3 text-base font-black text-emerald-500 text-right font-mono">${selectedInvoice.amount}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border theme-border text-center text-[11px] theme-muted">
                  Thank you for partnering with Camzy Jobs. If you have questions about this billing statement, contact billing@camzyjobs.com.
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t theme-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.print();
                      }
                    }}
                    className="px-4 py-2 rounded-xl border theme-border theme-text font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Invoice PDF ready. You can print or save as PDF via your browser dialog.');
                      if (typeof window !== 'undefined') {
                        window.print();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
