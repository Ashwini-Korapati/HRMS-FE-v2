
// CreateDesignationPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createDesignation,
  selectDesignationCreating,
  selectDesignationCreateError,
  selectLastCreatedDesignation,
  resetDesignationState,
  fetchDesignations,
  selectDesignations,
} from "../../Redux/Public/designationSlice";
import { ChevronDown, CheckCircle2, Settings, Ban, Lock, Unlock, X, Plus, Sparkles, Shield, Activity, Users } from 'lucide-react';
import { PageHeading } from "./components";

// Enhanced Input Component with animations
function Input({ label, error, required, className = "", icon: Icon, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <label className="flex flex-col gap-1.5 group">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 transition-colors group-hover:text-neutral-800 dark:group-hover:text-neutral-200">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 ${isFocused ? 'text-orange-500' : 'text-neutral-400'}`} />
        )}
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-white dark:bg-neutral-900 border rounded-xl ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none transition-all duration-300 ${error ? 'border-rose-400 shadow-rose-100 dark:shadow-rose-900/20 shadow-lg' : isFocused ? 'border-orange-500 shadow-lg shadow-orange-100 dark:shadow-orange-900/20 ring-4 ring-orange-500/10' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'} ${className}`}
        />
      </div>
      {error && (
        <span className="text-xs text-rose-500 animate-in slide-in-from-top-1 duration-300">{error}</span>
      )}
    </label>
  );
}

// Enhanced TextArea Component
function TextArea({ label, error, required, className = "", ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <label className="flex flex-col gap-1.5 group">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 transition-colors group-hover:text-neutral-800 dark:group-hover:text-neutral-200">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <textarea
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-white dark:bg-neutral-900 border rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none resize-none transition-all duration-300 ${error ? 'border-rose-400 shadow-rose-100 dark:shadow-rose-900/20 shadow-lg' : isFocused ? 'border-orange-500 shadow-lg shadow-orange-100 dark:shadow-orange-900/20 ring-4 ring-orange-500/10' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'} ${className}`}
      />
      {error && (
        <span className="text-xs text-rose-500 animate-in slide-in-from-top-1 duration-300">{error}</span>
      )}
    </label>
  );
}

// Enhanced Select Component
function Select({ label, error, required, className = "", children, icon: Icon, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <label className="flex flex-col gap-1.5 group">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 transition-colors group-hover:text-neutral-800 dark:group-hover:text-neutral-200">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 pointer-events-none z-10 ${isFocused ? 'text-orange-500' : 'text-neutral-400'}`} />
        )}
        <select
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-white dark:bg-neutral-900 border rounded-xl ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 appearance-none outline-none transition-all duration-300 ${error ? 'border-rose-400 shadow-rose-100 dark:shadow-rose-900/20 shadow-lg' : isFocused ? 'border-orange-500 shadow-lg shadow-orange-100 dark:shadow-orange-900/20 ring-4 ring-orange-500/10' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'} ${className}`}
        >
          {children}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-all duration-300 ${isFocused ? 'text-orange-500 rotate-180' : 'text-neutral-400'}`} />
      </div>
      {error && (
        <span className="text-xs text-rose-500 animate-in slide-in-from-top-1 duration-300">{error}</span>
      )}
    </label>
  );
}

const CreateDesignationPage = () => {
  const dispatch = useDispatch();
  const creating = useSelector(selectDesignationCreating);
  const error = useSelector(selectDesignationCreateError);
  const lastCreated = useSelector(selectLastCreatedDesignation);
  const designations = useSelector(selectDesignations);

  const initialForm = {
    title: "",
    description: "",
    level: "",
    parentId: "",
    enabledRoutes: {
      Project: "Inactive",
      Task: "Inactive",
    },
  };

  const [formData, setFormData] = useState(initialForm);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch designations on component mount
  useEffect(() => {
    dispatch(fetchDesignations());
  }, [dispatch]);

  useEffect(() => {
    if (creating === "succeeded") {
      const message = `Designation "${lastCreated?.title || formData.title}" created successfully!`;
      setSuccessMessage(message);
      setShowSuccess(true);

      // reset form
      setFormData(initialForm);

      // Refresh designations list
      dispatch(fetchDesignations());

      // auto-hide and reset slice state
      const t = setTimeout(() => {
        setShowSuccess(false);
        dispatch(resetDesignationState());
      }, 4500);
      return () => clearTimeout(t);
    }

    if (creating === "failed" && error) {
      setShowSuccess(false);
    }

    return () => {
      if (creating === "succeeded") dispatch(resetDesignationState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, error, lastCreated, dispatch]);

  const handleInputChange = (field, value) =>
    setFormData((p) => ({
      ...p,
      [field]: field === 'level' ? (value === '' ? '' : Number(value)) : value
    }));

  const handleToggleChange = (route) =>
    setFormData((p) => ({
      ...p,
      enabledRoutes: {
        ...p.enabledRoutes,
        [route]: p.enabledRoutes[route] === "Active" ? "Inactive" : "Active",
      },
    }));

  const handleToggleAll = (status) => {
    const newRoutes = Object.keys(formData.enabledRoutes).reduce((a, r) => {
      a[r] = status;
      return a;
    }, {});
    setFormData((p) => ({ ...p, enabledRoutes: newRoutes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    // Prepare the data for API
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      level: formData.level ? Number(formData.level) : undefined,
      parentId: formData.parentId || undefined,
      enabledRoutes: Object.entries(formData.enabledRoutes)
        .filter(([_, status]) => status === "Active")
        .map(([route]) => route.toLowerCase())
        .join(",") || undefined
    };

    dispatch(createDesignation(submitData));
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    dispatch(resetDesignationState());
  };

  const handleCloseError = () => {
    dispatch(resetDesignationState());
  };

  const isFormValid = Boolean(formData.title.trim());
  const activeRoutesCount = Object.values(formData.enabledRoutes).filter(
    (s) => s === "Active"
  ).length;
  const totalRoutesCount = Object.keys(formData.enabledRoutes).length;

  const getStatusIcon = (status) =>
    status === "Active" ? (
      <CheckCircle2 className="text-orange-600 w-4 h-4" />
    ) : (
      <Ban className="text-neutral-400 w-4 h-4" />
    );

  const LEVEL_OPTIONS = [
    { value: 1, label: 'Intern' },
    { value: 2, label: 'Junior' },
    { value: 3, label: 'Mid' },
    { value: 4, label: 'Senior' },
    { value: 5, label: 'Lead' },
    { value: 6, label: 'Director' },
  ];
  
  const levelLabel = (v) => LEVEL_OPTIONS.find(o => o.value === v)?.label || 'N/A';

  // Get parent designation title for display
  const getParentTitle = (parentId) => {
    if (!parentId) return 'None';
    const parent = designations.find(d => d.id === parentId);
    return parent ? parent.title : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                Create Designation
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                Define a new role and manage route permissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 animate-in slide-in-from-top-5 duration-700 delay-100">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {activeRoutesCount}/{totalRoutesCount}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Routes Active</div>
                  </div>
                </div>
                
                <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-700"></div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Progress</span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                      {totalRoutesCount > 0 ? Math.round((activeRoutesCount / totalRoutesCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${totalRoutesCount > 0 ? (activeRoutesCount / totalRoutesCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAll("Active")}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:border-orange-300 dark:hover:border-orange-800 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5"
                  type="button"
                >
                  <Unlock className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm font-medium">Activate All</span>
                </button>
                <button
                  onClick={() => handleToggleAll("Inactive")}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  type="button"
                >
                  <Lock className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm font-medium">Deactivate All</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <section className="lg:col-span-2 animate-in slide-in-from-left-6 duration-700 delay-200">
            <div className="bg-white dark:bg-neutral-900 border border-orange-500/20 dark:border-orange-500/40 rounded-2xl shadow-xl overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Form Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Designation Details
                  </h2>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Designation Title"
                      required
                      placeholder="e.g., Senior Developer"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      icon={Sparkles}
                    />
                    <Select
                      label="Level"
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      icon={Activity}
                    >
                      <option value="">Select level…</option>
                      {LEVEL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>

                  {/* Parent Designation Dropdown */}
                  <Select
                    label="Parent Designation"
                    value={formData.parentId}
                    onChange={(e) => handleInputChange('parentId', e.target.value)}
                    icon={Users}
                  >
                    <option value="">No parent designation</option>
                    {designations.map((designation) => (
                      <option key={designation.id} value={designation.id}>
                        {designation.title}
                      </option>
                    ))}
                  </Select>
                  
                  <TextArea
                    rows={3}
                    label="Description"
                    placeholder="Short description of the designation"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!isFormValid || creating === 'loading'}
                      className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${isFormValid ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}
                    >
                      <div className={`absolute inset-0 transition-opacity duration-300 ${isFormValid ? 'opacity-0 group-hover:opacity-0' : 'opacity-0'}`}></div>
                      <Plus className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isFormValid ? 'group-hover:rotate-90' : ''}`} />
                      <span className="relative z-10">{creating === 'loading' ? 'Creating…' : 'Create Designation'}</span>
                    </button>

                    {error && (
                      <div className="animate-in slide-in-from-right-4 duration-300 inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm">
                        <div className="font-medium text-sm">Error:</div>
                        <div className="text-sm">{error}</div>
                        <button onClick={handleCloseError} type="button" className="ml-1 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Table */}
                <div className="border-t border-orange-500/20 dark:border-orange-500/40">
                  <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-600" />
                      Route Permissions
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Route</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {Object.entries(formData.enabledRoutes).map(([route, status]) => {
                          const isActive = status === 'Active';
                          return (
                            <tr key={route} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-100' : 'bg-neutral-300 dark:bg-neutral-700 scale-75'}`}></div>
                                  <span className="font-medium text-neutral-900 dark:text-white">{route}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isActive ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 shadow-sm' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
                                  {getStatusIcon(status)} 
                                  <span>{status}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleChange(route)}
                                  className={`group/btn relative inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-600 dark:text-orange-400 hover:shadow-lg hover:shadow-orange-500/20' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'} hover:-translate-y-0.5`}
                                >
                                  {isActive ? (
                                    <Settings className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-90" />
                                  ) : (
                                    <Ban className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Preview Card */}
          <aside className="animate-in slide-in-from-right-6 duration-700 delay-300 space-y-4">
            <div className="sticky top-6 bg-white dark:bg-neutral-900 border border-orange-500/20 dark:border-orange-500/40 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Preview
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="group">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Title</div>
                    <div className="text-base font-semibold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg transition-colors group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700">
                      {formData.title || 'Not set'}
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Level</div>
                    <div className="text-base font-semibold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg transition-colors group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700">
                      {formData.level === '' ? 'Not set' : levelLabel(formData.level)}
                    </div>
                  </div>

                  <div className="group">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Parent Designation</div>
                    <div className="text-base font-semibold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg transition-colors group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700">
                      {getParentTitle(formData.parentId)}
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">Description</div>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg min-h-[60px] transition-colors group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700">
                      {formData.description || 'No description provided'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Permissions
                    </div>
                    <div className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-1 rounded-full">
                      {activeRoutesCount}/{totalRoutesCount}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {Object.entries(formData.enabledRoutes).map(([k, v]) => (
                      <li key={k} className="group flex items-center justify-between gap-2 text-sm bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5 rounded-lg transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-center gap-2">
                          {v === 'Active' ? (
                            <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Ban className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className="font-medium text-neutral-900 dark:text-white">{k}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v === 'Active' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
                          {v}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pl-4 pr-2 py-3 rounded-2xl shadow-2xl shadow-orange-500/50 flex items-center gap-3 min-w-[320px] border border-orange-400">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 text-sm font-medium">{successMessage}</div>
              <button 
                onClick={handleCloseSuccess} 
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" 
                aria-label="close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateDesignationPage;