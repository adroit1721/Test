import React, { useState, useMemo } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Search,
  Filter,
  User,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Share2,
  X,
  ExternalLink,
  Printer,
  Sparkles,
  Users,
  CheckCircle2,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { CadetUserAccount } from '../types';

interface CadetDirectoryViewProps {
  isCadetLoggedIn?: boolean;
}

export const CadetDirectoryView: React.FC<CadetDirectoryViewProps> = ({ isCadetLoggedIn = false }) => {
  const { cadetUsers, isAdminLoggedIn, deleteCadetUser } = useAdminData();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Current' | 'Ex-cadet'>('All');
  const [platoonFilter, setPlatoonFilter] = useState<string>('All');
  const [rankFilter, setRankFilter] = useState<string>('All');
  const [batchFilter, setBatchFilter] = useState<string>('All');

  // Selected Cadet for Modal
  const [selectedCadet, setSelectedCadet] = useState<CadetUserAccount | null>(null);

  // Available Batches extracted from cadets
  const availableBatches = useMemo(() => {
    const set = new Set<string>();
    cadetUsers.forEach((c) => {
      if (c.batch) set.add(c.batch.trim());
    });
    return Array.from(set).sort();
  }, [cadetUsers]);

  // Filtered Cadets
  const filteredCadets = useMemo(() => {
    return cadetUsers.filter((cadet) => {
      // Must be approved (or status !== 'Pending Approval')
      if (cadet.status === 'Pending Approval' && !cadet.isApproved) return false;

      // Type Filter
      if (typeFilter === 'Current' && cadet.cadetType === 'Ex-cadet') return false;
      if (typeFilter === 'Ex-cadet' && cadet.cadetType !== 'Ex-cadet' && cadet.category !== 'Ex-cadets') return false;

      // Platoon Filter
      if (platoonFilter !== 'All') {
        if (platoonFilter === 'Ex-cadets Alumni') {
          if (cadet.cadetType !== 'Ex-cadet' && cadet.category !== 'Ex-cadets') return false;
        } else if (cadet.category !== platoonFilter && cadet.platoon !== platoonFilter) {
          return false;
        }
      }

      // Rank Filter
      if (rankFilter !== 'All') {
        const r = (cadet.rank || '').toLowerCase();
        const rf = rankFilter.toLowerCase();
        if (rf === 'cuo') {
          if (!r.includes('cuo') && !r.includes('under officer')) return false;
        } else if (rf === 'sgt') {
          if (!r.includes('sgt') && !r.includes('sergeant') && !r.includes('seargent')) return false;
        } else if (rf === 'cpl') {
          if ((!r.includes('cpl') && !r.includes('corporal')) || r.includes('lance') || r.includes('lcpl')) return false;
        } else if (rf === 'lcpl') {
          if (!r.includes('lcpl') && !r.includes('lance')) return false;
        } else if (rf === 'cadet') {
          if (
            r.includes('under officer') ||
            r.includes('cuo') ||
            r.includes('sergeant') ||
            r.includes('seargent') ||
            r.includes('corporal')
          ) {
            return false;
          }
          if (!r.includes('cadet') && !r.includes('cdt')) return false;
        } else {
          if (!r.includes(rf)) return false;
        }
      }

      // Batch Filter
      if (batchFilter !== 'All' && cadet.batch !== batchFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (cadet.name || '').toLowerCase().includes(q) ||
          (cadet.nameBangla || '').toLowerCase().includes(q) ||
          (cadet.cadetNo || '').toLowerCase().includes(q) ||
          (cadet.rank || '').toLowerCase().includes(q) ||
          (cadet.batch || '').toLowerCase().includes(q) ||
          (cadet.phone || '').includes(q) ||
          (cadet.department || '').toLowerCase().includes(q) ||
          (cadet.currentJob || '').toLowerCase().includes(q) ||
          (cadet.achievements || '').toLowerCase().includes(q) ||
          (cadet.additionalSkills || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [cadetUsers, typeFilter, platoonFilter, rankFilter, batchFilter, searchQuery]);

  const totalCurrentCount = useMemo(
    () => cadetUsers.filter((c) => c.cadetType !== 'Ex-cadet' && c.category !== 'Ex-cadets').length,
    [cadetUsers]
  );
  const totalExCount = useMemo(
    () => cadetUsers.filter((c) => c.cadetType === 'Ex-cadet' || c.category === 'Ex-cadets').length,
    [cadetUsers]
  );

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] p-5 sm:p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdc6b3]/40 dark:border-[#38342c] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#eedc82] text-[#1c1c18]">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1c1c18] dark:text-[#fcfbf7]">
                Official Cadet Directory & Roster
              </h2>
            </div>
            <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-1">
              Browse currently serving cadets and ex-cadet alumni. Click any card to view the complete verified profile.
            </p>
          </div>

          {/* Quick Count Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eedc82]/40 text-[#493e08] dark:text-[#eedc82] border border-[#d5c470]">
              Total: {cadetUsers.length} Cadets
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              Serving: {totalCurrentCount}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
              Alumni: {totalExCount}
            </span>
          </div>
        </div>

        {/* Primary Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTypeFilter('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'All'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs border border-[#cfb84f]'
                : 'bg-[#f6f3ed] dark:bg-[#141311] text-[#695c4e] dark:text-[#aca596] border border-[#cdc6b3]/50'
            }`}
          >
            All Cadets ({cadetUsers.length})
          </button>
          <button
            onClick={() => setTypeFilter('Current')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'Current'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs border border-[#cfb84f]'
                : 'bg-[#f6f3ed] dark:bg-[#141311] text-[#695c4e] dark:text-[#aca596] border border-[#cdc6b3]/50'
            }`}
          >
            Currently Serving ({totalCurrentCount})
          </button>
          <button
            onClick={() => setTypeFilter('Ex-cadet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'Ex-cadet'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-xs border border-[#cfb84f]'
                : 'bg-[#f6f3ed] dark:bg-[#141311] text-[#695c4e] dark:text-[#aca596] border border-[#cdc6b3]/50'
            }`}
          >
            Ex-Cadets Alumni ({totalExCount})
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c7767] dark:text-[#aca596]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, mobile, skill..."
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] pl-9 pr-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            />
          </div>

          {/* Platoon Filter */}
          <div>
            <select
              value={platoonFilter}
              onChange={(e) => setPlatoonFilter(e.target.value)}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            >
              <option value="All">All Platoons / Wings</option>
              <option value="Male Platoon">Male Platoon</option>
              <option value="Female Platoon">Female Platoon</option>
              <option value="Band Platoon">Band Platoon</option>
              <option value="Ex-cadets Alumni">Ex-cadets Alumni</option>
            </select>
          </div>

          {/* Rank Filter */}
          <div>
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            >
              <option value="All">All Ranks</option>
              <option value="CUO">Cadet Under Officer (CUO)</option>
              <option value="SGT">Cadet Sergeant (SGT)</option>
              <option value="CPL">Cadet Corporal (CPL)</option>
              <option value="LCPL">Lance Corporal (LCPL)</option>
              <option value="Cadet">Cadet (CDT)</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
            >
              <option value="All">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cadets Cards Grid */}
      {filteredCadets.length === 0 ? (
        <div className="p-12 text-center bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] rounded-3xl space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eedc82]/30 flex items-center justify-center text-[#6b5e10] dark:text-[#eedc82]">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">No Cadets Found</h3>
          <p className="text-xs text-[#695c4e] dark:text-[#aca596] max-w-sm mx-auto">
            No cadet records matched your filter criteria. Try adjusting the search query or selecting "All Platoons".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCadets.map((cadet, idx) => (
            <div
              key={cadet.id || `cdt-${idx}`}
              onClick={() => setSelectedCadet(cadet)}
              className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] hover:border-[#eedc82] dark:hover:border-[#eedc82] p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group text-left"
            >
              {/* Header: Photo & Rank Badge */}
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  {cadet.avatarUrl ? (
                    <img
                      src={cadet.avatarUrl}
                      alt={cadet.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d8c360] shadow-2xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#eedc82]/30 border-2 border-[#d8c360] flex items-center justify-center text-lg font-black text-[#504205] dark:text-[#eedc82]">
                      {cadet.name ? cadet.name.charAt(0) : <User className="w-6 h-6" />}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase ${
                      cadet.cadetType === 'Ex-cadet'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {cadet.cadetType === 'Ex-cadet' ? 'Alumni' : 'Serving'}
                  </span>
                </div>

                <div className="space-y-1 min-w-0 flex-grow">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#eedc82] text-[#3d3203] border border-[#cfb84f] inline-block truncate max-w-full">
                    {cadet.rank}
                  </span>
                  <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] leading-tight line-clamp-1 group-hover:text-[#6b5e10] dark:group-hover:text-[#eedc82] transition-colors">
                    {cadet.name}
                  </h3>
                  {cadet.nameBangla && (
                    <p className="text-[11px] text-[#7c7767] dark:text-[#aca596] truncate">
                      {cadet.nameBangla}
                    </p>
                  )}
                </div>
              </div>

              {/* Details: Batch, Platoon / Job, Mobile */}
              <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#38342c] space-y-1.5 text-xs text-[#5c5746] dark:text-[#aca596]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7c7767] dark:text-[#aca596]">Cadet ID / Batch:</span>
                  <span className="font-mono font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {cadet.cadetNo} • {cadet.batch}
                  </span>
                </div>

                {cadet.currentJob ? (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7c7767] dark:text-[#aca596]">Status / Job:</span>
                    <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7] truncate max-w-[150px]">
                      {cadet.currentJob}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7c7767] dark:text-[#aca596]">Platoon:</span>
                    <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7] truncate max-w-[150px]">
                      {cadet.platoon}
                    </span>
                  </div>
                )}

                {/* Mobile / Phone */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-[#7c7767] dark:text-[#aca596] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" /> Mobile:
                  </span>
                  <span className="font-mono font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                    {cadet.phone || 'N/A'}
                  </span>
                </div>

                {/* Achievements tag / preview */}
                {cadet.achievements && (
                  <div className="pt-1">
                    <div className="p-1.5 rounded-lg bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3]/40 dark:border-[#38342c] text-[10px] text-[#4a4738] dark:text-[#d4cec1] line-clamp-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#6b5e10] shrink-0" />
                      <span className="truncate">{cadet.achievements}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* View Full Profile Footer */}
              <div className="pt-1 flex items-center gap-1.5">
                <button
                  type="button"
                  className="flex-1 py-1.5 rounded-xl bg-[#f6f3ed] dark:bg-[#141311] hover:bg-[#eedc82] dark:hover:bg-[#eedc82] hover:text-[#1c1c18] dark:hover:text-[#1c1c18] text-[#695c4e] dark:text-[#aca596] font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Full Record</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Permanently delete cadet "${cadet.cadetNo} - ${cadet.name}" from database?`)) {
                        deleteCadetUser(cadet.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-red-500 hover:text-white hover:bg-red-600 bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete Cadet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          FULL CADET DETAILS POPUP MODAL ("MODAL UPS")
          ========================================================================= */}
      {selectedCadet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#eedc82] text-[#1c1c18]">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#1c1c18] dark:text-[#fcfbf7]">
                    Official Verified Cadet Profile
                  </h3>
                  <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                    New Govt. Degree College Platoon, Rajshahi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white hover:bg-[#f0eee8] dark:hover:bg-[#2c2923] cursor-pointer"
                  title="Print Record"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedCadet(null)}
                  className="p-2 rounded-xl text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white hover:bg-[#f0eee8] dark:hover:bg-[#2c2923] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Hero Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 sm:p-5 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c]">
              <div className="relative shrink-0">
                {selectedCadet.avatarUrl ? (
                  <img
                    src={selectedCadet.avatarUrl}
                    alt={selectedCadet.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-28 rounded-2xl object-cover border-2 border-[#d8c360] shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-28 rounded-2xl bg-[#eedc82]/30 border-2 border-[#d8c360] flex items-center justify-center text-3xl font-black text-[#504205] dark:text-[#eedc82]">
                    {selectedCadet.name ? selectedCadet.name.charAt(0) : <User className="w-10 h-10" />}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1c1c18] text-white">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-grow">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#1c1c18] text-white">
                    {selectedCadet.cadetNo}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-[#eedc82] text-[#3d3203]">
                    {selectedCadet.rank}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedCadet.cadetType === 'Ex-cadet'
                        ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {selectedCadet.cadetType === 'Ex-cadet' ? 'Alumni' : 'Serving Cadet'}
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black text-[#1c1c18] dark:text-[#fcfbf7]">
                  {selectedCadet.name}
                </h4>
                {selectedCadet.nameBangla && (
                  <p className="text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                    {selectedCadet.nameBangla}
                  </p>
                )}

                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  {selectedCadet.platoon} • {selectedCadet.batch}{' '}
                  {selectedCadet.section ? `• ${selectedCadet.section}` : ''}
                </p>
              </div>
            </div>

            {/* Profile Grid Details */}
            <div className="space-y-4 text-xs">
              {/* Personal & Family Details */}
              <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Personal & Academic Record
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                  {selectedCadet.fatherName && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Father's Name:</span>
                      <strong className="text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.fatherName}{' '}
                        {selectedCadet.fatherNameBangla && `(${selectedCadet.fatherNameBangla})`}
                      </strong>
                    </div>
                  )}
                  {selectedCadet.motherName && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Mother's Name:</span>
                      <strong className="text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.motherName}{' '}
                        {selectedCadet.motherNameBangla && `(${selectedCadet.motherNameBangla})`}
                      </strong>
                    </div>
                  )}
                  <div>
                    <span className="text-[#7c7767] dark:text-[#aca596] block">Date of Birth:</span>
                    <span className="font-medium text-[#1c1c18] dark:text-[#fcfbf7]">
                      {selectedCadet.dob || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7c7767] dark:text-[#aca596] block">Gender & Religion:</span>
                    <span className="font-medium text-[#1c1c18] dark:text-[#fcfbf7]">
                      {selectedCadet.gender || 'Male'} • {selectedCadet.religion || 'Islam'}
                    </span>
                  </div>
                  {selectedCadet.className && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Class / Academic Level:</span>
                      <span className="font-medium text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.className}
                      </span>
                    </div>
                  )}
                  {selectedCadet.department && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Department / Subject:</span>
                      <span className="font-medium text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.department}
                      </span>
                    </div>
                  )}
                  {selectedCadet.currentJob && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Current Status / Job:</span>
                      <strong className="text-[#6b5e10] dark:text-[#eedc82]">
                        {selectedCadet.currentJob}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Address */}
              <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact Information & Address
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <span className="text-[#7c7767] dark:text-[#aca596] block">Contact Number (Self):</span>
                    <strong className="font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                      {selectedCadet.phone || 'N/A'}
                    </strong>
                  </div>
                  {selectedCadet.guardianPhone && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Guardian Contact:</span>
                      <strong className="font-mono text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.guardianPhone}
                      </strong>
                    </div>
                  )}
                  {selectedCadet.email && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Email Address:</span>
                      <span className="text-[#1c1c18] dark:text-[#fcfbf7]">{selectedCadet.email}</span>
                    </div>
                  )}
                  {selectedCadet.socialMedia && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Social Media:</span>
                      <span className="text-blue-600 dark:text-blue-400 truncate block">
                        {selectedCadet.socialMedia}
                      </span>
                    </div>
                  )}
                  {selectedCadet.presentAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Present Address:</span>
                      <span className="text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.presentAddress}
                      </span>
                    </div>
                  )}
                  {selectedCadet.permanentAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Permanent Address:</span>
                      <span className="text-[#1c1c18] dark:text-[#fcfbf7]">
                        {selectedCadet.permanentAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & BNCC Achievements */}
              {(selectedCadet.achievements || selectedCadet.additionalSkills) && (
                <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#38342c] space-y-2.5">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Skills & BNCC Achievements
                  </h5>
                  {selectedCadet.achievements && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Achievements in BNCC:</span>
                      <p className="font-medium text-[#1c1c18] dark:text-[#fcfbf7] whitespace-pre-line mt-0.5">
                        {selectedCadet.achievements}
                      </p>
                    </div>
                  )}
                  {selectedCadet.additionalSkills && (
                    <div>
                      <span className="text-[#7c7767] dark:text-[#aca596] block">Additional Skills:</span>
                      <p className="font-medium text-[#1c1c18] dark:text-[#fcfbf7] whitespace-pre-line mt-0.5">
                        {selectedCadet.additionalSkills}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between">
              {isAdminLoggedIn && selectedCadet && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to permanently delete cadet "${selectedCadet.cadetNo} - ${selectedCadet.name}" from the database?`
                      )
                    ) {
                      deleteCadetUser(selectedCadet.id);
                      setSelectedCadet(null);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Cadet</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCadet(null)}
                className="japandi-btn-secondary px-6 py-2.5 text-xs font-bold cursor-pointer ml-auto"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
