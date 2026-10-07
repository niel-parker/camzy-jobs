'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Filter, Sparkles, Building2, Clock, ChevronRight, CheckCircle2, ArrowRight, Bookmark, SlidersHorizontal, RotateCcw, Award, HelpCircle } from 'lucide-react';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useTheme } from '../../context/ThemeContext';

interface ScreeningQ {
  id: string;
  questionText: string;
  questionType: 'TEXT' | 'YES_NO' | 'CHOICE';
  options?: string[];
  isRequired?: boolean;
}

interface JobItem {
  id: string;
  title: string;
  companyName: string;
  companySlug: string;
  companyType: 'Product Based' | 'MNC' | 'Startup' | 'Unicorn';
  location: string;
  category: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  experienceYears: string;
  salary: string;
  salaryMin: number;
  isFeatured?: boolean;
  postedAt: string;
  description: string;
  tags: string[];
  matchScore: number;
  screeningQuestions?: ScreeningQ[];
}

const MOCK_JOBS: JobItem[] = [
  {
    id: 'job-101',
    title: 'Senior Full Stack Engineer (Next.js & NestJS)',
    companyName: 'TechCorp Global',
    companySlug: 'techcorp-global',
    companyType: 'Product Based',
    location: 'San Francisco, CA',
    category: 'Software Engineering',
    workMode: 'Remote',
    experienceYears: '3-5 Yrs',
    salary: '$140,000 - $180,000',
    salaryMin: 140000,
    isFeatured: true,
    postedAt: '2 hours ago',
    description: 'Lead architecture of scalable multi-tenant SaaS systems, Next.js frontend micro-services, and TypeORM NestJS backend services.',
    tags: ['React', 'Next.js', 'NestJS', 'TypeScript', 'MySQL'],
    matchScore: 96,
    screeningQuestions: [
      {
        id: 'sq1',
        questionText: 'How many years of commercial experience do you have with Next.js & NestJS?',
        questionType: 'CHOICE',
        options: ['1-2 Years', '3-5 Years', '5+ Years'],
        isRequired: true,
      },
      {
        id: 'sq2',
        questionText: 'Are you legally authorized to work in San Francisco or Remote?',
        questionType: 'YES_NO',
        isRequired: true,
      },
      {
        id: 'sq3',
        questionText: 'What is your current notice period or earliest available start date?',
        questionType: 'TEXT',
        isRequired: false,
      },
    ],
  },
  {
    id: 'job-102',
    title: 'Lead AI Application & Agentic Systems Engineer',
    companyName: 'Innovate AI Labs',
    companySlug: 'innovate-ai-labs',
    companyType: 'Unicorn',
    location: 'New York, NY',
    category: 'Data & AI',
    workMode: 'Hybrid',
    experienceYears: '5-8 Yrs',
    salary: '$180,000 - $230,000',
    salaryMin: 180000,
    isFeatured: true,
    postedAt: '5 hours ago',
    description: 'Drive LLM integration, agentic frameworks, vector database architectures, and real-time streaming interfaces for high-scale clients.',
    tags: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'VectorDB'],
    matchScore: 92,
  },
  {
    id: 'job-103',
    title: 'Senior Product Designer (Design Systems)',
    companyName: 'Creative Design Co',
    companySlug: 'creative-design-co',
    companyType: 'Startup',
    location: 'Austin, TX',
    category: 'Design & UX',
    workMode: 'Remote',
    experienceYears: '3-5 Yrs',
    salary: '$120,000 - $150,000',
    salaryMin: 120000,
    isFeatured: false,
    postedAt: '1 day ago',
    description: 'Craft high-contrast light & dark theme systems, component libraries, dynamic combobox interfaces, and mobile responsive layouts.',
    tags: ['Figma', 'UI/UX Design', 'Design Systems', 'Tailwind CSS'],
    matchScore: 88,
  },
  {
    id: 'job-104',
    title: 'DevOps & Kubernetes Infrastructure Specialist',
    companyName: 'CloudScale Solutions',
    companySlug: 'cloudscale-solutions',
    companyType: 'MNC',
    location: 'Seattle, WA',
    category: 'DevOps & Cloud',
    workMode: 'Onsite',
    experienceYears: '5-8 Yrs',
    salary: '$150,000 - $190,000',
    salaryMin: 150000,
    isFeatured: false,
    postedAt: '2 days ago',
    description: 'Manage Kubernetes clusters, multi-stage Docker container deployments, AWS infrastructure, and GitHub Actions CI/CD automation.',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    matchScore: 85,
  },
  {
    id: 'job-105',
    title: 'Growth Marketing & Analytics Lead',
    companyName: 'Nexus Metrics',
    companySlug: 'nexus-metrics',
    companyType: 'Product Based',
    location: 'Boston, MA',
    category: 'Marketing',
    workMode: 'Remote',
    experienceYears: '1-3 Yrs',
    salary: '$110,000 - $140,000',
    salaryMin: 110000,
    isFeatured: false,
    postedAt: '3 days ago',
    description: 'Architect customer acquisition funnels, subscription analytics, content marketing strategy, and employer campaign optimization.',
    tags: ['Growth Hacking', 'SEO', 'Product Analytics', 'B2B'],
    matchScore: 81,
  },
];

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Cities / Remote' },
  { value: 'San Francisco, CA', label: 'San Francisco, CA' },
  { value: 'New York, NY', label: 'New York, NY' },
  { value: 'Austin, TX', label: 'Austin, TX' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Boston, MA', label: 'Boston, MA' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data & AI', label: 'Data Science & AI' },
  { value: 'Design & UX', label: 'Design & UI/UX' },
  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
  { value: 'Marketing', label: 'Marketing & Sales' },
];

export default function NaukriStyleJobSearchPage() {
  const { sdk } = useTheme();
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedMinSalary, setSelectedMinSalary] = useState(0);
  const [savedJobsMap, setSavedJobsMap] = useState<Record<string, boolean>>({});

  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    async function loadBackendJobs() {
      try {
        setIsLoadingJobs(true);
        const remoteJobs = await sdk.getJobListings();
        if (remoteJobs && remoteJobs.length > 0) {
          const mappedJobs: JobItem[] = remoteJobs.map((j) => ({
            id: j.id,
            title: j.title,
            companyName: j.companyName || 'Verified Employer',
            companySlug: j.companyName ? j.companyName.toLowerCase().replace(/\s+/g, '-') : 'company',
            companyType: j.isConsultancy ? 'Startup' : 'Product Based',
            location: j.location || 'San Francisco, CA',
            category: j.category || 'Software Engineering',
            workMode: j.isRemote ? 'Remote' : 'Onsite',
            experienceYears: j.experienceLevel === 'Senior' ? '5-8 Yrs' : j.experienceLevel === 'Lead' ? '8+ Yrs' : '1-3 Yrs',
            salary: j.salaryMin && j.salaryMax ? `$${j.salaryMin.toLocaleString()} - $${j.salaryMax.toLocaleString()}` : '$140,000 - $180,000',
            salaryMin: j.salaryMin || 100000,
            isFeatured: j.isFeatured,
            postedAt: 'Verified Position',
            description: j.description,
            tags: [j.category, j.employmentType, j.experienceLevel],
            matchScore: 95,
            screeningQuestions: j.screeningQuestions,
          }));
          setJobsList(mappedJobs);
        } else {
          setJobsList([]);
        }
      } catch (err) {
        console.warn('Backend job fetch fallback:', err);
        setJobsList([]);
      } finally {
        setIsLoadingJobs(false);
      }
    }
    loadBackendJobs();
  }, [sdk]);

  // Quick Apply Modal
  const [applyingJob, setApplyingJob] = useState<JobItem | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  const toggleBookmark = (id: string) => {
    setSavedJobsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredJobs = jobsList.filter((job) => {
    const matchesKeyword =
      !keyword ||
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.companyName.toLowerCase().includes(keyword.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(keyword.toLowerCase()));

    const matchesLocation =
      selectedLocation === 'all' ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || job.category === selectedCategory;

    const matchesWorkMode =
      selectedWorkMode === 'all' || job.workMode === selectedWorkMode;

    const matchesExp =
      selectedExp === 'all' || job.experienceYears === selectedExp;

    const matchesSalary = job.salaryMin >= selectedMinSalary;

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesCategory &&
      matchesWorkMode &&
      matchesExp &&
      matchesSalary
    );
  });

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedLocation('all');
    setSelectedCategory('all');
    setSelectedWorkMode('all');
    setSelectedExp('all');
    setSelectedMinSalary(0);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySuccess(true);
    setTimeout(() => {
      setApplyingJob(null);
      setApplySuccess(false);
      setApplicantName('');
      setApplicantEmail('');
      setScreeningAnswers({});
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 rounded-2xl theme-surface border theme-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight theme-text">
              Find Your Dream Job on <span className="text-indigo-500">Camzy Jobs</span>
            </h1>
            <p className="text-xs theme-muted mt-1">
              Explore verified company openings with salary transparency and 1-click apply.
            </p>
          </div>

          <a
            href="/auth/register/candidate"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1"
          >
            <Award className="h-4 w-4 mr-1" />
            <span>Create Verified Candidate Profile</span>
          </a>
        </div>

        {/* Search Inputs Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 theme-muted" />
            <input
              type="text"
              placeholder="Designation, skills, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border theme-border theme-input theme-text text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <SearchableSelect
              options={LOCATION_OPTIONS}
              value={selectedLocation}
              onChange={setSelectedLocation}
              placeholder="Search location..."
            />
          </div>

          <div>
            <SearchableSelect
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Department / Functional area..."
            />
          </div>
        </div>
      </div>

      {/* Main Naukri-Style 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: NAUKRI-GRADE MULTI-FACET FILTER SIDEBAR */}
        <div className="p-5 rounded-2xl theme-surface border theme-border space-y-6 h-fit shadow-sm">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <h3 className="text-sm font-extrabold theme-text flex items-center">
              <Filter className="h-4 w-4 text-indigo-500 mr-1.5" /> All Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-indigo-500 hover:underline flex items-center"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </button>
          </div>

          {/* Work Mode Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider">
              Work Mode / Environment
            </label>
            <div className="space-y-1.5">
              {['all', 'Remote', 'Hybrid', 'Onsite'].map((mode) => (
                <label key={mode} className="flex items-center space-x-2 text-xs theme-text cursor-pointer hover:text-indigo-500">
                  <input
                    type="radio"
                    name="workMode"
                    checked={selectedWorkMode === mode}
                    onChange={() => setSelectedWorkMode(mode)}
                    className="accent-indigo-600"
                  />
                  <span>{mode === 'all' ? 'All Work Modes' : mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Range Filter */}
          <div className="space-y-2 border-t theme-border pt-4">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider">
              Experience Level
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'Any Experience' },
                { id: '1-3 Yrs', label: '1 - 3 Years' },
                { id: '3-5 Yrs', label: '3 - 5 Years' },
                { id: '5-8 Yrs', label: '5 - 8 Years' },
              ].map((exp) => (
                <label key={exp.id} className="flex items-center space-x-2 text-xs theme-text cursor-pointer hover:text-indigo-500">
                  <input
                    type="radio"
                    name="expYears"
                    checked={selectedExp === exp.id}
                    onChange={() => setSelectedExp(exp.id)}
                    className="accent-indigo-600"
                  />
                  <span>{exp.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary Range Filter */}
          <div className="space-y-2 border-t theme-border pt-4">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider">
              Min Salary Expectation (${(selectedMinSalary / 1000).toFixed(0)}k+)
            </label>
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={selectedMinSalary}
              onChange={(e) => setSelectedMinSalary(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] theme-muted font-mono">
              <span>Any</span>
              <span>$100k</span>
              <span>$200k+</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: JOB CARDS FEED */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Chips & Result Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 theme-surface p-4 rounded-xl border theme-border text-xs">
            <p className="font-bold theme-text">
              Showing <span className="text-indigo-500 font-extrabold">{filteredJobs.length}</span> verified job postings
            </p>

            <div className="flex items-center space-x-2 theme-muted font-medium">
              <span>Sort by:</span>
              <select className="bg-transparent font-bold theme-text focus:outline-none cursor-pointer">
                <option value="relevance">Relevance & Match Score</option>
                <option value="date">Most Recent</option>
                <option value="salary">Salary (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Job Feed Cards */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 theme-surface border theme-border rounded-xl space-y-3">
              <Briefcase className="mx-auto h-12 w-12 theme-muted" />
              <h3 className="text-lg font-bold theme-text">No positions match your selected criteria</h3>
              <p className="text-xs theme-muted">Try clearing some filter pills or searching for broader skills.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`p-6 rounded-2xl border transition-all duration-200 theme-surface hover:shadow-lg space-y-4 ${
                  job.isFeatured
                    ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'theme-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold theme-text hover:text-indigo-500 cursor-pointer transition-colors">
                        {job.title}
                      </h2>
                      {job.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          <Sparkles className="h-3 w-3 mr-0.5" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-semibold">
                      <span className="text-indigo-500">{job.companyName}</span>
                      <span className="theme-muted">•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] theme-text">
                        {job.companyType}
                      </span>
                      <span className="theme-muted">•</span>
                      <span className="text-emerald-500 font-bold">{job.matchScore}% Match Score</span>
                    </div>

                    {/* Metadata Pill Specs */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs theme-muted">
                      <span className="inline-flex items-center">
                        <Briefcase className="h-3.5 w-3.5 mr-1 text-indigo-500" /> {job.experienceYears}
                      </span>
                      <span className="inline-flex items-center font-bold theme-text">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> {job.salary}
                      </span>
                      <span className="inline-flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" /> {job.location} ({job.workMode})
                      </span>
                      <span className="inline-flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" /> {job.postedAt}
                      </span>
                    </div>

                    <p className="text-xs theme-muted line-clamp-2 pt-1 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 theme-text border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 theme-border">
                    <button
                      onClick={() => toggleBookmark(job.id)}
                      className={`p-2 rounded-lg border theme-border transition-all ${
                        savedJobsMap[job.id] ? 'text-amber-500 bg-amber-500/10' : 'theme-muted hover:theme-text'
                      }`}
                      title="Save Job"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setApplyingJob(job)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                    >
                      <span>1-Click Apply</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg theme-surface border theme-border rounded-xl shadow-xl p-6 relative">
            {applySuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="text-xl font-bold theme-text">Application Sent to Recruiter!</h3>
                <p className="text-xs theme-muted">
                  Your candidate profile for <span className="font-semibold text-indigo-500">{applyingJob.title}</span> was delivered to {applyingJob.companyName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="border-b theme-border pb-3">
                  <h3 className="text-base font-bold theme-text">Quick Apply Position</h3>
                  <p className="text-xs text-indigo-500 font-bold">{applyingJob.title} at {applyingJob.companyName}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex.morgan@example.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Recruiter Custom Screening Questions Section */}
                {applyingJob.screeningQuestions && applyingJob.screeningQuestions.length > 0 && (
                  <div className="border-t border-b theme-border py-4 my-2 space-y-4 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-500">
                      <HelpCircle className="w-4 h-4" />
                      <span>Recruiter Screening Questions</span>
                    </div>

                    <div className="space-y-3">
                      {applyingJob.screeningQuestions.map((q) => (
                        <div key={q.id} className="space-y-1.5">
                          <label className="text-xs font-semibold theme-text block">
                            {q.questionText} {q.isRequired && <span className="text-rose-500">*</span>}
                          </label>

                          {q.questionType === 'CHOICE' && (
                            <select
                              required={q.isRequired}
                              value={screeningAnswers[q.id] || ''}
                              onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [q.id]: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">-- Select Response --</option>
                              {q.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}

                          {q.questionType === 'YES_NO' && (
                            <div className="flex items-center space-x-4 pt-1 text-xs font-bold">
                              {['Yes', 'No'].map((opt) => (
                                <label key={opt} className="flex items-center space-x-1.5 cursor-pointer theme-text">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    required={q.isRequired}
                                    checked={screeningAnswers[q.id] === opt}
                                    onChange={() => setScreeningAnswers({ ...screeningAnswers, [q.id]: opt })}
                                    className="accent-indigo-600"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {q.questionType === 'TEXT' && (
                            <input
                              type="text"
                              required={q.isRequired}
                              placeholder="Type your response here..."
                              value={screeningAnswers[q.id] || ''}
                              onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [q.id]: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border theme-border theme-input theme-text text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-3 border-t theme-border">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="px-4 py-2 rounded-lg text-xs font-medium theme-muted hover:theme-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Submit 1-Click Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
