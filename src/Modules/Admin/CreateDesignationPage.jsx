// CreateDesignationPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createDesignation,
  selectDesignationCreating,
  selectDesignationCreateError,
  selectLastCreatedDesignation,
  resetDesignationState,
} from "../../Redux/Public/designationSlice";
import {
  Settings,
  Block,
  ToggleOn,
  ToggleOff,
  CheckCircle,
  Cancel,
  Add,
  Visibility,
  LockOpen,
  Lock,
  Close,
} from "@mui/icons-material";
import { PageHeading } from "./components";

const CreateDesignationPage = () => {
  const dispatch = useDispatch();
  const creating = useSelector(selectDesignationCreating);
  const error = useSelector(selectDesignationCreateError);
  const lastCreated = useSelector(selectLastCreatedDesignation);

  const initialForm = {
    title: "",
    enabledRoutes: {
      Project: "Inactive",
      Task: "Inactive",
    },
  };

  const [formData, setFormData] = useState(initialForm);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (creating === "succeeded") {
      const message = `Designation "${lastCreated?.title || formData.title}" created successfully!`;
      setSuccessMessage(message);
      setShowSuccess(true);

      // reset form
      setFormData(initialForm);

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
    setFormData((p) => ({ ...p, [field]: value }));

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
    dispatch(createDesignation(formData));
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
      <CheckCircle className="text-green-500 w-4 h-4" />
    ) : (
      <Cancel className="text-amber-500 w-4 h-4" />
    );

  return (
    <div className="min-h-screen bg-slate-50">
 

      <main className="max-w-7xl mx-auto px-4 py-6">
        <PageHeading
          title="Create Designation"
          subtitle="Define a new role and manage route permissions"
        />

        {/* action row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {activeRoutesCount} of {totalRoutesCount} routes active
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAll("Active")}
              title="Activate All"
              className="inline-flex items-center gap-2 px-3 py-1 rounded border bg-green-50 text-green-700 hover:bg-green-100"
            >
              <LockOpen fontSize="small" /> Activate All
            </button>
            <button
              onClick={() => handleToggleAll("Inactive")}
              title="Deactivate All"
              className="inline-flex items-center gap-2 px-3 py-1 rounded border bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              <Lock fontSize="small" /> Deactivate All
            </button>
          </div>
        </div>

        {/* layout: left permissions + right preview */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form + permissions table */}
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Title input */}
              <div className="p-6 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation Title *
                </label>
                <div className="flex gap-3">
                  <input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Senior Developer, Project Manager"
                    className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!isFormValid || creating === "loading"}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow ${
                      !isFormValid || creating === "loading"
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:translate-y-[-2px] hover:shadow-lg"
                    }`}
                  >
                    <Add />
                    {creating === "loading" ? "Creating..." : "Create"}
                  </button>
                </div>

                {/* inline error */}
                {error && (
                  <div className="mt-3 inline-flex items-center gap-3 bg-red-50 text-red-700 px-3 py-2 rounded">
                    <div className="font-medium">Error:</div>
                    <div className="text-sm">{error}</div>
                    <button
                      onClick={handleCloseError}
                      className="ml-auto p-1 rounded hover:bg-red-100"
                    >
                      <Close fontSize="small" />
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">
                        Permission
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {Object.entries(formData.enabledRoutes).map(
                      ([route, status]) => {
                        const isActive = status === "Active";
                        return (
                          <tr
                            key={route}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                              {route}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {getStatusIcon(status)} {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleChange(route)}
                                title={
                                  isActive
                                    ? "Active — click to deactivate"
                                    : "No Access — click to activate"
                                }
                                className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                              >
                                {isActive ? (
                                  <Settings className="text-[#F59E0B]" />
                                ) : (
                                  <Block className="text-gray-400" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          </section>

          {/* Right: preview card */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                <Visibility className="text-[#F97316]" />
                Preview
              </div>
              <div className="text-sm text-gray-700">
                <div className="mb-2">
                  <span className="font-medium">Title:</span>{" "}
                  {formData.title || "N/A"}
                </div>

                <div className="font-medium text-gray-800 mb-2">
                  Route Permissions ({activeRoutesCount}/{totalRoutesCount})
                </div>

                <ul className="space-y-2">
                  {Object.entries(formData.enabledRoutes).map(([k, v]) => (
                    <li
                      key={k}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      {v === "Active" ? (
                        <Settings className="text-green-500 w-4 h-4" />
                      ) : (
                        <Block className="text-gray-400 w-4 h-4" />
                      )}
                      <span className="font-medium w-24">{k}</span>
                      <span className="text-gray-600">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Success toast */}
        {showSuccess && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded shadow flex items-center gap-2">
              <CheckCircle />
              <div className="text-sm">{successMessage}</div>
              <button
                onClick={handleCloseSuccess}
                className="ml-2 p-1 hover:bg-white/10 rounded"
                aria-label="close"
              >
                <Close fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateDesignationPage;
