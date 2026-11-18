"use client";

import { useAuth } from "@/components/AuthContext";
import { restaurantService } from "@/lib/api";
import { hasPermission, type StaffPermissionKey } from "@/lib/restaurant/staff/permissions";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Role = { id: number; name: string; description: string | null; permissionCount: number; staffCount: number; permissions: string[] };
type StaffRow = {
  id: number;
  userId?: number;
  displayName: string;
  email: string;
  phone: string | null;
  status: string;
  role: { id: number; name: string };
  joinedAt: string | null;
  createdAt?: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  joinedAt: string;
};

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", password: "", roleId: "", joinedAt: "" };

const AVATAR_TONES = ["bg-[#F4E3D7] text-[#8F4220]", "bg-[#E3EDE6] text-[#2F6B45]", "bg-[#E6E8F3] text-[#3E4A8A]", "bg-[#F3E6EE] text-[#8A3E6B]", "bg-[#EFEAD8] text-[#7A6420]"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function Avatar({ name, id, size = "h-10 w-10" }: { name: string; id: number; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_TONES[id % AVATAR_TONES.length]}`}>
      {initials(name)}
    </span>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-[#F0E8DE] text-[#6B5A50]"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-[#A99888]"}`} />
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function StatCard({ label, value, hint, children }: { label: string; value: React.ReactNode; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7568]">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-[#1C1410]">{value}</p>
      {children}
      {hint ? <p className="mt-1 text-xs text-[#6B5A50]">{hint}</p> : null}
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-[#1C1410]">{title}</h4>
      {hint ? <p className="mt-0.5 text-xs text-[#6B5A50]">{hint}</p> : null}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#1C1410] outline-none placeholder:text-[#A99888] focus:border-[#1C1410] disabled:bg-[#F6F1EA] disabled:text-[#8A7568]";

export default function RestaurantStaffPage() {
  const { user } = useAuth();
  const permissions = user?.restaurantAccess?.permissions ?? "ALL";
  const canManage = hasPermission(permissions, "staff.manage");
  const canRoles = hasPermission(permissions, "roles.manage");

  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [seats, setSeats] = useState<{ used: number; limit: number | null }>({ used: 0, limit: null });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [staffRes, rolesRes] = await Promise.all([restaurantService.listStaff(), restaurantService.listRoles()]);
    setLoading(false);
    if (staffRes.ok) {
      setStaff(staffRes.data.staff || []);
      setSeats({
        used: Number(staffRes.data.seats?.used || 0),
        limit: staffRes.data.seats?.limit ?? null,
      });
    }
    if (rolesRes.ok) {
      setRoles(
        (rolesRes.data.roles || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? null,
          permissionCount: Array.isArray(r.permissions) ? r.permissions.length : 0,
          permissions: Array.isArray(r.permissions) ? r.permissions : [],
          staffCount: Number(r.staffCount || 0),
        })),
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Staff can only give / manage access they hold themselves (the owner can do anything). */
  const roleWithinMyAccess = useCallback(
    (roleId: number) => {
      if (permissions === "ALL") return true;
      const role = roles.find((r) => r.id === roleId);
      if (!role) return false;
      return role.permissions.every((key) => hasPermission(permissions, key as StaffPermissionKey));
    },
    [permissions, roles],
  );
  const isSelf = (row: StaffRow) => user?.restaurantAccess?.kind === "staff" && row.userId != null && row.userId === user?.id;
  const canTouch = (row: StaffRow) => canManage && roleWithinMyAccess(row.role.id);
  const assignableRoles = useMemo(() => roles.filter((r) => roleWithinMyAccess(r.id)), [roles, roleWithinMyAccess]);

  const activeCount = staff.filter((s) => s.status === "ACTIVE").length;
  const disabledCount = staff.length - activeCount;
  const seatsFull = seats.limit != null && seats.used >= seats.limit;
  const seatPct = seats.limit ? Math.min(100, Math.round((seats.used / seats.limit) * 100)) : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (roleFilter !== "ALL" && String(row.role.id) !== roleFilter) return false;
      if (!q) return true;
      return [row.displayName, row.email, row.phone || "", row.role.name].some((v) => v.toLowerCase().includes(q));
    });
  }, [staff, search, statusFilter, roleFilter]);

  const reveal = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  const closePanel = useCallback(() => {
    setShown(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closePanel]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, roleId: roles.length === 1 ? String(roles[0].id) : "" });
    setShowPassword(false);
    reveal();
  };

  const openEdit = (row: StaffRow) => {
    setEditing(row);
    setForm({
      name: row.displayName,
      email: row.email,
      phone: row.phone || "",
      password: "",
      roleId: String(row.role.id),
      joinedAt: row.joinedAt ? row.joinedAt.slice(0, 10) : "",
    });
    setShowPassword(false);
    reveal();
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = new Uint32Array(12);
    crypto.getRandomValues(bytes);
    set({ password: Array.from(bytes, (b) => chars[b % chars.length]).join("") });
    setShowPassword(true);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(form.password);
      toast.success("Password copied.");
    } catch {
      toast.error("Could not copy.");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.roleId) {
      toast.error("Choose a role.");
      return;
    }
    setBusy(true);
    const result = editing
      ? await restaurantService.updateStaff(editing.id, {
          name: form.name,
          phone: form.phone || null,
          roleId: Number(form.roleId),
          joinedAt: form.joinedAt || null,
          ...(form.password ? { password: form.password } : {}),
        })
      : await restaurantService.createStaff({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          roleId: Number(form.roleId),
          joinedAt: form.joinedAt || null,
        });
    setBusy(false);
    if (!result.ok) {
      toast.error((result.data as { error?: string })?.error || "Could not save staff member.");
      return;
    }
    toast.success(editing ? "Staff member updated." : "Staff member added.");
    closePanel();
    await load();
  };

  const setStatus = async (row: StaffRow, status: "ACTIVE" | "DISABLED") => {
    if (status === "DISABLED" && !window.confirm(`Disable ${row.displayName}? They will lose access to the restaurant dashboard.`)) return;
    const result = await restaurantService.updateStaff(row.id, { status });
    if (!result.ok) {
      toast.error((result.data as { error?: string })?.error || "Could not update staff.");
      return;
    }
    toast.success(status === "ACTIVE" ? `${row.displayName} re-enabled.` : `${row.displayName} disabled.`);
    await load();
  };

  const removeMember = async (row: StaffRow) => {
    if (!window.confirm(`Remove ${row.displayName} from your restaurant? They will no longer be able to sign in.`)) return false;
    const result = await restaurantService.removeStaff(row.id);
    if (!result.ok) {
      toast.error((result.data as { error?: string })?.error || "Could not remove staff member.");
      return false;
    }
    toast.success(`${row.displayName} removed.`);
    await load();
    return true;
  };

  const lockedSelf = Boolean(editing && isSelf(editing));
  const selectedRole = roles.find((r) => String(r.id) === form.roleId) || null;
  const filtersActive = search.trim() !== "" || statusFilter !== "ALL" || roleFilter !== "ALL";

  const rowActions = (row: StaffRow) =>
    canTouch(row) ? (
      <div className="flex items-center justify-end gap-1">
        <button type="button" onClick={() => openEdit(row)} className="h-8 cursor-pointer rounded-lg border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410] hover:bg-[#F6F1EA]">
          Edit
        </button>
        {isSelf(row) ? null : row.status === "ACTIVE" ? (
          <button type="button" onClick={() => void setStatus(row, "DISABLED")} className="h-8 cursor-pointer rounded-lg border-none bg-transparent px-3 text-xs font-semibold text-[#8A7568] hover:bg-[#F6F1EA]">
            Disable
          </button>
        ) : (
          <button type="button" onClick={() => void setStatus(row, "ACTIVE")} className="h-8 cursor-pointer rounded-lg border-none bg-transparent px-3 text-xs font-semibold text-[#C4622D] hover:bg-[#FDF1EA]">
            Enable
          </button>
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#1C1410]">Staff</h2>
          <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
            Add team members, give each a role, and control exactly what they can see and do in your restaurant dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canRoles ? (
            <Link
              href="/dashboard/restaurant/staff/roles"
              className="inline-flex h-10 items-center rounded-xl border border-[#E7DDD2] bg-white px-4 text-sm font-semibold text-[#1C1410] no-underline hover:bg-[#F6F1EA]"
            >
              Manage roles
            </Link>
          ) : null}
          {canManage ? (
            <button
              type="button"
              onClick={openCreate}
              disabled={assignableRoles.length === 0 || seatsFull}
              title={seatsFull ? "Seat limit reached" : assignableRoles.length === 0 ? (roles.length === 0 ? "Create a role first" : "No roles available for you to assign") : undefined}
              className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add staff
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Team members" value={loading ? "–" : staff.length} hint="Across all roles" />
        <StatCard
          label="Seats used"
          value={loading ? "–" : seats.limit != null ? `${seats.used} / ${seats.limit}` : `${seats.used}`}
          hint={seats.limit == null ? "Unlimited on your plan" : seatsFull ? "Limit reached — upgrade to add more" : `${seats.limit - seats.used} seat${seats.limit - seats.used === 1 ? "" : "s"} available`}
        >
          {seats.limit != null ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F0E8DE]">
              <div className={`h-full rounded-full ${seatsFull ? "bg-[#C4622D]" : "bg-[#1C1410]"}`} style={{ width: `${seatPct}%` }} />
            </div>
          ) : null}
        </StatCard>
        <StatCard label="Active" value={loading ? "–" : activeCount} hint="Can sign in now" />
        <StatCard label="Disabled" value={loading ? "–" : disabledCount} hint={`${roles.length} role${roles.length === 1 ? "" : "s"} defined`} />
      </div>

      {seatsFull && canManage ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#F0D9B5] bg-[#FFF8EC] px-4 py-3 text-sm text-[#7A5418]">
          <span>You have used all {seats.limit} staff seats on your plan. Disable a member or upgrade to add more.</span>
          <Link href="/dashboard/billing" className="font-semibold text-[#C4622D]">View plans</Link>
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone or role…"
          className={`${inputCls} h-10 min-w-[220px] flex-1 sm:max-w-sm`}
        />
        <div className="flex rounded-xl border border-[#E7DDD2] bg-white p-0.5">
          {(["ALL", "ACTIVE", "DISABLED"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`h-9 cursor-pointer rounded-[10px] border-none px-3 text-xs font-semibold ${statusFilter === value ? "bg-[#1C1410] text-white" : "bg-transparent text-[#6B5A50]"}`}
            >
              {value === "ALL" ? "All" : value === "ACTIVE" ? "Active" : "Disabled"}
            </button>
          ))}
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#1C1410]" aria-label="Filter by role">
          <option value="ALL">All roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setRoleFilter("ALL");
            }}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold text-[#C4622D]"
          >
            Reset
          </button>
        ) : null}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl border border-[#E7DDD2] bg-white" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9CCBD] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1C1410]">No staff yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B5A50]">
            {roles.length === 0 ? "Start by creating a role, then add the people who will use it." : "Add your first team member and assign them a role."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {roles.length === 0 && canRoles ? (
              <Link href="/dashboard/restaurant/staff/roles" className="inline-flex h-10 items-center rounded-xl bg-[#1C1410] px-4 text-sm font-semibold text-white no-underline">
                Create a role
              </Link>
            ) : canManage ? (
              <button type="button" onClick={openCreate} className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white">
                + Add staff
              </button>
            ) : null}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E7DDD2] bg-white px-4 py-10 text-center text-sm text-[#6B5A50]">No staff match your filters.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#F0E8DE] bg-[#FCFAF7] text-xs uppercase tracking-wide text-[#8A7568]">
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  {canManage ? <th className="px-4 py-3 text-right font-semibold">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const role = roles.find((r) => r.id === row.role.id);
                  return (
                    <tr key={row.id} className={`border-b border-[#F6F1EA] last:border-b-0 ${row.status !== "ACTIVE" ? "opacity-70" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.displayName} id={row.id} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#1C1410]">{row.displayName}</p>
                            <p className="truncate text-xs text-[#6B5A50]">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-[#F6F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#1C1410]">{row.role.name}</span>
                        {role ? <p className="mt-1 text-[11px] text-[#8A7568]">{role.permissionCount} permissions</p> : null}
                      </td>
                      <td className="px-4 py-3 text-[#2A211C]">{row.phone || "—"}</td>
                      <td className="px-4 py-3 text-[#2A211C]">{formatDate(row.joinedAt || row.createdAt)}</td>
                      <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                      {canManage ? <td className="px-4 py-3">{rowActions(row)}</td> : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <article key={row.id} className={`rounded-2xl border border-[#E7DDD2] bg-white p-4 ${row.status !== "ACTIVE" ? "opacity-70" : ""}`}>
                <div className="flex items-start gap-3">
                  <Avatar name={row.displayName} id={row.id} size="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-base font-semibold text-[#1C1410]">{row.displayName}</p>
                      <StatusPill status={row.status} />
                    </div>
                    <p className="truncate text-sm text-[#6B5A50]">{row.email}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-[#8A7568]">Role</dt>
                    <dd className="mt-0.5 font-semibold text-[#1C1410]">{row.role.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A7568]">Phone</dt>
                    <dd className="mt-0.5 font-semibold text-[#1C1410]">{row.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A7568]">Joined</dt>
                    <dd className="mt-0.5 font-semibold text-[#1C1410]">{formatDate(row.joinedAt || row.createdAt)}</dd>
                  </div>
                </dl>
                {canManage ? <div className="mt-3 border-t border-[#F0E8DE] pt-3">{rowActions(row)}</div> : null}
              </article>
            ))}
          </div>
        </>
      )}

      {/* Drawer */}
      {open ? (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={editing ? "Edit staff member" : "Add staff member"}>
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`} onClick={closePanel} />
          <form
            onSubmit={(event) => void submit(event)}
            className={`absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-[#FBF8F4] shadow-2xl transition-transform duration-200 ease-out ${shown ? "translate-x-0" : "translate-x-full"}`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#E7DDD2] bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                {editing ? <Avatar name={editing.displayName} id={editing.id} size="h-11 w-11" /> : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#C4622D]">{editing ? "Edit staff" : "New staff member"}</p>
                  <h3 className="mt-0.5 text-xl font-semibold text-[#1C1410]">{editing ? editing.displayName : "Add staff member"}</h3>
                  {editing ? <StatusPill status={editing.status} /> : <p className="mt-1 text-sm text-[#6B5A50]">They sign in with the email and password you set here.</p>}
                </div>
              </div>
              <button type="button" onClick={closePanel} aria-label="Close" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E7DDD2] bg-white text-lg leading-none text-[#6B5A50] hover:bg-[#F6F1EA]">
                ×
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
              <section>
                <SectionTitle title="Personal details" />
                <div className="space-y-3 rounded-2xl border border-[#E7DDD2] bg-white p-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Full name <span className="text-[#C4622D]">*</span></span>
                    <input required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Priya Sharma" className={inputCls} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Email <span className="text-[#C4622D]">*</span></span>
                    <input required type="email" disabled={Boolean(editing)} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@example.com" className={inputCls} />
                    {editing ? <span className="mt-1 block text-[11px] text-[#8A7568]">Email is the sign-in ID and can’t be changed.</span> : null}
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Phone</span>
                      <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Optional" className={inputCls} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Joining date</span>
                      <input type="date" value={form.joinedAt} onChange={(e) => set({ joinedAt: e.target.value })} className={inputCls} />
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle title="Role & access" hint="Permissions come from the role. You can change it any time." />
                {lockedSelf ? (
                  <p className="mb-2 rounded-xl bg-[#FFF8EC] px-3 py-2 text-xs text-[#7A5418]">You can’t change your own role. Ask the owner or another manager.</p>
                ) : null}
                {assignableRoles.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#E7DDD2] bg-white px-4 py-5 text-center text-sm text-[#6B5A50]">
                    {roles.length === 0 ? "No roles yet." : "No roles available. You can only assign roles with access you already have."}
                  </p>
                ) : (
                  <div className={`space-y-2 ${lockedSelf ? "pointer-events-none opacity-60" : ""}`}>
                    {assignableRoles.map((role) => {
                      const active = String(role.id) === form.roleId;
                      return (
                        <label
                          key={role.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-3.5 py-3 transition ${active ? "border-[#1C1410] ring-1 ring-[#1C1410]" : "border-[#E7DDD2] hover:border-[#C9B8A6]"}`}
                        >
                          <input type="radio" name="role" className="peer sr-only" disabled={lockedSelf} checked={active} onChange={() => set({ roleId: String(role.id) })} />
                          <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-[#C4622D] ${active ? "border-[#1C1410]" : "border-[#C9B8A6]"}`}>
                            {active ? <span className="h-2 w-2 rounded-full bg-[#1C1410]" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-[#1C1410]">{role.name}</span>
                              <span className="text-[11px] text-[#8A7568]">{role.permissionCount} permissions · {role.staffCount} staff</span>
                            </span>
                            {role.description ? <span className="mt-0.5 block text-xs text-[#6B5A50]">{role.description}</span> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {canRoles ? (
                  <Link href="/dashboard/restaurant/staff/roles" className="mt-2 inline-block text-xs font-semibold text-[#C4622D]">
                    Manage roles &amp; permissions →
                  </Link>
                ) : null}
              </section>

              {lockedSelf ? null : (
              <section>
                <SectionTitle title={editing ? "Reset password" : "Sign-in password"} hint={editing ? "Leave blank to keep the current password." : "Minimum 8 characters. Share it with the staff member securely."} />
                <div className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
                  <div className="flex gap-2">
                    <input
                      required={!editing}
                      type={showPassword ? "text" : "password"}
                      minLength={editing && !form.password ? undefined : 8}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => set({ password: e.target.value })}
                      placeholder={editing ? "New password (optional)" : "Password"}
                      className={inputCls}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="h-11 shrink-0 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410] hover:bg-[#F6F1EA]">
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
                    <button type="button" onClick={generatePassword} className="cursor-pointer border-none bg-transparent p-0 text-[#C4622D]">Generate strong password</button>
                    {form.password ? (
                      <button type="button" onClick={() => void copyPassword()} className="cursor-pointer border-none bg-transparent p-0 text-[#6B5A50]">Copy</button>
                    ) : null}
                  </div>
                </div>
              </section>
              )}

              {editing && canManage && !lockedSelf ? (
                <section>
                  <SectionTitle title="Account status" />
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7DDD2] bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1410]">{editing.status === "ACTIVE" ? "Active" : "Disabled"}</p>
                      <p className="mt-0.5 text-xs text-[#6B5A50]">
                        {editing.status === "ACTIVE" ? "Disabling blocks sign-in and frees up a seat." : "Re-enabling uses one staff seat."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await setStatus(editing, editing.status === "ACTIVE" ? "DISABLED" : "ACTIVE");
                        closePanel();
                      }}
                      className="h-9 shrink-0 cursor-pointer rounded-lg border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410] hover:bg-[#F6F1EA]"
                    >
                      {editing.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#F1D5CB] bg-[#FFF7F4] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#8F3A1C]">Remove from restaurant</p>
                      <p className="mt-0.5 text-xs text-[#8A5A4A]">Deletes their access for good and frees the seat. Their past activity stays in the logs.</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const done = await removeMember(editing);
                        if (done) closePanel();
                      }}
                      className="h-9 shrink-0 cursor-pointer rounded-lg border border-[#E7B9A8] bg-white px-3 text-xs font-semibold text-[#B4531F] hover:bg-[#FDF1EA]"
                    >
                      Remove
                    </button>
                  </div>
                </section>
              ) : null}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-[#E7DDD2] bg-white px-5 py-3.5 sm:px-6">
              <p className="min-w-0 truncate text-xs text-[#6B5A50]">
                {selectedRole ? <>Role: <span className="font-semibold text-[#1C1410]">{selectedRole.name}</span></> : "No role selected"}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={closePanel} className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-5 text-sm font-semibold text-[#1C1410] hover:bg-[#F6F1EA]">
                  Cancel
                </button>
                <button type="submit" disabled={busy || !form.roleId} className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? "Saving…" : editing ? "Save changes" : "Add staff"}
                </button>
              </div>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}
