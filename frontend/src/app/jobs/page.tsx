'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Briefcase, IndianRupee, Filter, Sparkles, Building2, Clock, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, Bookmark, SlidersHorizontal, RotateCcw, Award, Tag, X } from 'lucide-react';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useTheme } from '../../context/ThemeContext';
import { LocationSearchDropdown } from '../../components/LocationSearchDropdown';
import { MultiSkillSearchInput } from '../../components/MultiSkillSearchInput';
import { ExperienceRangeItem } from '@job-portal/sdk';

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
  minExperience?: number;
  maxExperience?: number;
  matchScore: number;
  screeningQuestions?: ScreeningQ[];
}

const MOCK_JOBS: JobItem[] = [];

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'San Francisco, CA', label: 'San Francisco, CA' },
  { value: 'New York, NY', label: 'New York, NY' },
  { value: 'Austin, TX', label: 'Austin, TX' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Boston, MA', label: 'Boston, MA' },
  { value: 'Remote', label: 'Remote / Anywhere' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering & Full Stack' },
  { value: 'DevOps & Architecture', label: 'DevOps & Cloud Architecture' },
  { value: 'Design & Creative', label: 'Design & UI/UX Systems' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence & LLMs' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data & AI', label: 'Data & AI' },
  { value: 'Design & UX', label: 'Design & UX' },
  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Product Management', label: 'Product Management' },
];

function JobDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, sdk, user } = useTheme();

  // Search & Filter State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedMinSalary, setSelectedMinSalary] = useState(0);

  // Bookmark Saved State
  const [savedJobsMap, setSavedJobsMap] = useState<Record<string, boolean>>({});

  // Dynamic Jobs List
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Dynamic Master Experience Ranges
  const [masterExpRanges, setMasterExpRanges] = useState<ExperienceRangeItem[]>([]);
  const [selectedExpRangeId, setSelectedExpRangeId] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 15;

  // Initialize search filters from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    const skillsParam = searchParams.get('skills');
    const q = searchParams.get('query') || searchParams.get('keyword') || searchParams.get('q');
    const loc = searchParams.get('location') || searchParams.get('loc');
    const cat = searchParams.get('category');
    const exp = searchParams.get('expRange') || searchParams.get('exp');

    if (skillsParam) {
      const parsed = skillsParam.split(',').map((s) => s.trim()).filter(Boolean);
      setSelectedSkills(parsed);
    } else if (q && q.includes(',')) {
      const parsed = q.split(',').map((s) => s.trim()).filter(Boolean);
      setSelectedSkills(parsed);
    } else if (q) {
      setKeyword(q);
    }

    if (loc) setSelectedLocation(loc);
    if (cat) setSelectedCategory(cat);
    if (exp) setSelectedExpRangeId(exp);
  }, [searchParams]);

  useEffect(() => {
    async function loadMasterExperienceRanges() {
      try {
        const ranges = await sdk.getExperienceRanges();
        if (ranges && Array.isArray(ranges)) {
          setMasterExpRanges(ranges);
        }
      } catch (err) {
        console.warn('Error loading master experience ranges:', err);
      }
    }
    loadMasterExperienceRanges();
  }, [sdk]);

  useEffect(() => {
    async function loadBackendJobs() {
      setIsLoadingJobs(true);
      try {
        const fetched = await sdk.request<any[]>('/jobs');
        if (fetched && Array.isArray(fetched)) {
          // Strictly exclude any expired jobs from public search
          const activeOnly = fetched.filter((j) => !j.isExpired && j.status !== 'EXPIRED');
          const mappedJobs: JobItem[] = activeOnly.map((j) => ({
            id: j.id,
            title: j.title,
            companyName: j.companyName || 'Verified Corporate Partner',
            companySlug: j.companySlug || 'company',
            companyType: 'Product Based',
            location: j.locationCity
              ? j.locationState
                ? `${j.locationCity}, ${j.locationState}, ${j.locationCountry}`
                : `${j.locationCity}, ${j.locationCountry}`
              : j.location || 'Remote',
            category: j.category || j.department || 'Engineering',
            workMode: j.isRemote ? 'Remote' : 'Onsite',
            experienceYears: `${j.minExperience ?? 2} - ${j.maxExperience ?? 5} Yrs`,
            minExperience: j.minExperience ?? 0,
            maxExperience: j.maxExperience ?? 5,
            salary: j.isSalaryVisible && j.salaryMin ? `₹${Number(j.salaryMin).toLocaleString('en-IN')}${j.salaryMax ? ` - ₹${Number(j.salaryMax).toLocaleString('en-IN')}` : ''}` : 'Competitive',
            salaryMin: j.salaryMin || 0,
            isFeatured: j.isFeatured || false,
            postedAt: 'Verified Position',
            description: j.description,
            tags: j.skills && j.skills.length > 0 ? j.skills : [j.category || 'Tech', j.employmentType || 'Full Time'],
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

  useEffect(() => {
    async function loadCandidateSavedJobs() {
      if (!user) {
        setSavedJobsMap({});
        return;
      }
      try {
        const candidateId = user.candidateId || user.id;
        const profile = await sdk.getCandidateProfile(candidateId);
        if (profile && Array.isArray(profile.savedJobIds)) {
          const map: Record<string, boolean> = {};
          profile.savedJobIds.forEach((jid: string) => {
            map[jid] = true;
          });
          setSavedJobsMap(map);
        }
      } catch (err) {
        console.warn('Could not fetch candidate saved jobs:', err);
      }
    }
    loadCandidateSavedJobs();
  }, [user, sdk]);

  const toggleBookmark = async (id: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/jobs');
      return;
    }
    const nextState = !savedJobsMap[id];
    setSavedJobsMap((prev) => ({ ...prev, [id]: nextState }));

    try {
      const candidateId = user.candidateId || user.id;
      const res = await sdk.toggleSaveJob(candidateId, id);
      if (res && typeof res.saved === 'boolean') {
        setSavedJobsMap((prev) => ({ ...prev, [id]: res.saved }));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setSavedJobsMap((prev) => ({ ...prev, [id]: !nextState }));
    }
  };

  const handleApplyClick = (jobId: string) => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${jobId}?apply=true`);
    } else {
      router.push(`/jobs/${jobId}?apply=true`);
    }
  };

  const filteredJobs = jobsList
    .filter((job) => {
      // 1. Multi-Skills Matching
      const matchesSkills = (() => {
        if (selectedSkills.length === 0) return true;
        return selectedSkills.some((skill) => {
          const sLower = skill.toLowerCase();
          if (job.tags && job.tags.some((t) => t.toLowerCase().includes(sLower) || sLower.includes(t.toLowerCase()))) {
            return true;
          }
          if (job.title && job.title.toLowerCase().includes(sLower)) {
            return true;
          }
          if (job.description && job.description.toLowerCase().includes(sLower)) {
            return true;
          }
          return false;
        });
      })();

      // 2. Keyword Matching (for arbitrary text typed in keyword search)
      const qLower = keyword.trim().toLowerCase();
      const matchesKeyword =
        !qLower ||
        job.title.toLowerCase().includes(qLower) ||
        job.companyName.toLowerCase().includes(qLower) ||
        job.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        (job.description && job.description.toLowerCase().includes(qLower)) ||
        job.location.toLowerCase().includes(qLower);

      // 3. Location Matching
      const locTerm = (!selectedLocation || selectedLocation === 'all')
        ? ''
        : selectedLocation.split(',')[0].trim().toLowerCase();

      const matchesLocation =
        !locTerm ||
        job.location.toLowerCase().includes(locTerm) ||
        locTerm.includes(job.location.toLowerCase());

      // 4. Department / Category Matching (Shifted to Sidebar)
      const catTerm = (!selectedCategory || selectedCategory === 'all')
        ? ''
        : selectedCategory.toLowerCase();

      const matchesCategory = (() => {
        if (!catTerm) return true;
        const jc = job.category.toLowerCase();
        if (jc === catTerm || jc.includes(catTerm) || catTerm.includes(jc)) return true;
        const words1 = jc.split(/[\s&,/]+/);
        const words2 = catTerm.split(/[\s&,/]+/);
        return words1.some((w) => w.length >= 4 && words2.includes(w));
      })();

      // 5. Work Mode Matching
      const matchesWorkMode =
        selectedWorkMode === 'all' || job.workMode === selectedWorkMode;

      // 6. Experience Matching (using masterExpRanges synced across top bar & sidebar)
      const matchesExp = (() => {
        if (selectedExpRangeId === 'all') return true;
        const targetRange = masterExpRanges.find((r) => r.id === selectedExpRangeId);
        if (!targetRange) return true;
        const jobMin = job.minExperience ?? 0;
        const jobMax = job.maxExperience ?? 5;
        return jobMax >= targetRange.minYears && jobMin <= targetRange.maxYears;
      })();

      // 7. Salary Matching
      const matchesSalary = job.salaryMin >= selectedMinSalary;

      return (
        matchesSkills &&
        matchesKeyword &&
        matchesLocation &&
        matchesCategory &&
        matchesWorkMode &&
        matchesExp &&
        matchesSalary
      );
    })
    .sort((a, b) => {
      // If skills selected, prioritize jobs matching more skills
      if (selectedSkills.length > 0) {
        const scoreA = selectedSkills.filter((s) => {
          const sl = s.toLowerCase();
          return a.tags.some((t) => t.toLowerCase().includes(sl)) || a.title.toLowerCase().includes(sl);
        }).length;
        const scoreB = selectedSkills.filter((s) => {
          const sl = s.toLowerCase();
          return b.tags.some((t) => t.toLowerCase().includes(sl)) || b.title.toLowerCase().includes(sl);
        }).length;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      return 0;
    });

  const pagedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearAllFilters = () => {
    setSelectedSkills([]);
    setKeyword('');
    setSelectedLocation('all');
    setSelectedCategory('all');
    setSelectedWorkMode('all');
    setSelectedExp('all');
    setSelectedExpRangeId('all');
    setSelectedMinSalary(0);
    setPage(1);
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
              Explore verified company openings with salary transparency and candidate profile applications.
            </p>
          </div>

          <a
            href="/auth/login"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1"
          >
            <Award className="h-4 w-4 mr-1" />
            <span>Sign In / Create Profile</span>
          </a>
        </div>

        {/* Harmonized Main Filter Bar (Matching Home Page: Skills, Experience, Location, Action) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-2">
          {/* 1. Skills Multi-select / Keyword Search */}
          <div className="md:col-span-5 relative">
            <MultiSkillSearchInput
              selectedSkills={selectedSkills}
              onChangeSkills={(skills) => {
                setSelectedSkills(skills);
                setPage(1);
              }}
              inputValue={keyword}
              onChangeInput={(val) => {
                setKeyword(val);
                setPage(1);
              }}
              placeholder="Skills, job title, keywords..."
            />
          </div>

          {/* 2. Experience Level Dropdown (masterExpRanges) */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={selectedExpRangeId}
                onChange={(e) => {
                  setSelectedExpRangeId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer appearance-none"
              >
                <option value="all">All Experience Levels</option>
                {masterExpRanges.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 3. Location Dropdown */}
          <div className="md:col-span-3">
            <LocationSearchDropdown
              value={selectedLocation === 'all' ? '' : selectedLocation}
              onChange={(val) => {
                setSelectedLocation(val || 'all');
                setPage(1);
              }}
              placeholder="Location (City, Country)..."
            />
          </div>

          {/* 4. Action: Reset Filters */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main CamzyJobs 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: FILTERS SIDEBAR */}
        <div className="theme-surface p-5 rounded-2xl border theme-border space-y-5 h-fit shadow-sm">
          <div className="flex items-center justify-between border-b theme-border pb-3">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold theme-text uppercase tracking-wider">Filter Jobs</h3>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-indigo-500 hover:underline flex items-center"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </button>
          </div>

          {/* Department / Functional Area Filter (Shifted from Main to Side Filter) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider flex items-center justify-between">
              <span>Department / Area</span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <SearchableSelect
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(cat) => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              placeholder="All Departments..."
            />
          </div>

          {/* Work Mode Filter */}
          <div className="space-y-2 border-t theme-border pt-4">
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
                    onChange={() => {
                      setSelectedWorkMode(mode);
                      setPage(1);
                    }}
                    className="accent-indigo-600"
                  />
                  <span>{mode === 'all' ? 'All Work Modes' : mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Range Filter (Dynamic from Super Admin) */}
          <div className="space-y-2 border-t theme-border pt-4">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider flex items-center justify-between">
              <span>Experience Level</span>
              {selectedExpRangeId !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedExpRangeId('all');
                    setPage(1);
                  }}
                  className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 text-xs theme-text cursor-pointer hover:text-indigo-500">
                <input
                  type="radio"
                  name="expYears"
                  checked={selectedExpRangeId === 'all'}
                  onChange={() => {
                    setSelectedExpRangeId('all');
                    setPage(1);
                  }}
                  className="accent-indigo-600"
                />
                <span className={selectedExpRangeId === 'all' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>
                  Any Experience
                </span>
              </label>

              {masterExpRanges.map((rng) => (
                <label key={rng.id} className="flex items-center space-x-2 text-xs theme-text cursor-pointer hover:text-indigo-500">
                  <input
                    type="radio"
                    name="expYears"
                    checked={selectedExpRangeId === rng.id}
                    onChange={() => {
                      setSelectedExpRangeId(rng.id);
                      setPage(1);
                    }}
                    className="accent-indigo-600"
                  />
                  <span className={selectedExpRangeId === rng.id ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>
                    {rng.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Salary Range Filter */}
          <div className="space-y-2 border-t theme-border pt-4">
            <label className="block text-xs font-bold theme-text uppercase tracking-wider">
              Min Salary Expectation ({selectedMinSalary === 0 ? 'Any' : (selectedMinSalary >= 100000 ? `₹${(selectedMinSalary / 100000).toFixed(1)} LPA+` : `₹${selectedMinSalary.toLocaleString('en-IN')}+`)})
            </label>
            <input
              type="range"
              min="0"
              max="5000000"
              step="100000"
              value={selectedMinSalary}
              onChange={(e) => setSelectedMinSalary(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] theme-muted font-mono">
              <span>Any</span>
              <span>₹25L</span>
              <span>₹50L+</span>
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
            pagedJobs.map((job) => (
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
                      <Link href={`/jobs/${job.id}`}>
                        <h2 className="text-lg font-bold theme-text hover:text-indigo-500 cursor-pointer transition-colors">
                          {job.title}
                        </h2>
                      </Link>
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
                        <IndianRupee className="h-3.5 w-3.5 text-emerald-500" /> {job.salary}
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
                      onClick={() => handleApplyClick(job.id)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Job Feed Pagination */}
          {filteredJobs.length > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border theme-border theme-surface rounded-2xl text-xs theme-muted gap-3 shadow-sm">
              <span className="font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1} &ndash;{' '}
                {Math.min(page * PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length} jobs
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 px-3 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 inline mr-1" /> Prev
                </button>
                <span className="font-bold text-xs theme-text px-2">
                  Page {page} of {Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE))}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE)), p + 1)
                    )
                  }
                  disabled={page >= Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE))}
                  className="p-1.5 px-3 rounded-xl border theme-border font-bold text-xs theme-text hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  Next <ChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500 text-xs animate-pulse">Loading jobs directory...</div>}>
      <JobDirectoryContent />
    </Suspense>
  );
}
