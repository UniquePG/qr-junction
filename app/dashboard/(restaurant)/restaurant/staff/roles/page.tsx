"use client";

import { restaurantService } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/lib/toast";

type Permission = { key: string; label: string; group: string; implies?: string[] };
type PermissionGroup = { group: string; permissions: Permission[] };
type Template = { id: string; name: string; description: string; permissions: string[] };
type Role = {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  staffCount: number;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

function SectionHeading({ step, title, hint, aside }: { step: number; title: string; hint?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1410] text-xs font-semibold text-white">{step}</span>
        <div>
          <h4 className="text-sm font-semibold text-[#1C1410]">{title}</h4>
          {hint ? <p className="mt-0.5 text-xs text-[#6B5A50]">{hint}</p> : null}
        </div>
      </div>
      {aside}
    </div>
  );
}

export default function RestaurantRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [templateId, setTemplateId] = useState("empty");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editingId = editingRole?.id ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    const [rolesRes, permRes] = await Promise.all([
      restaurantService.listRoles(),
      restaurantService.listStaffPermissions(),
    ]);
    setLoading(false);
    if (rolesRes.ok) setRoles(rolesRes.data.roles || []);
    if (permRes.ok) {
      setGroups(permRes.data.groups || []);
      setTemplates(permRes.data.templates || []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const permMap = useMemo(() => {
    const map = new Map<string, Permission>();
    for (const g of groups) for (const p of g.permissions) map.set(p.key, p);
    return map;
  }, [groups]);

  const totalPermissions = permMap.size;

  /** Keys a permission needs (transitively). */
  const requiredFor = useCallback(
    (key: string) => {
      const out = new Set<string>();
      const queue = [...(permMap.get(key)?.implies || [])];
      while (queue.length) {
        const next = queue.pop()!;
        if (out.has(next)) continue;
        out.add(next);
        for (const more of permMap.get(next)?.implies || []) queue.push(more);
      }
      return out;
    },
    [permMap],
  );

  /** Keys that depend on a permission (transitively). */
  const dependentsOf = useCallback(
    (key: string) => {
      const out = new Set<string>();
      let changed = true;
      const targets = new Set([key]);
      while (changed) {
        changed = false;
        for (const p of permMap.values()) {
          if (out.has(p.key)) continue;
          if ((p.implies || []).some((i) => targets.has(i))) {
            out.add(p.key);
            targets.add(p.key);
            changed = true;
          }
        }
      }
      return out;
    },
    [permMap],
  );

  const toggle = (key: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
        for (const dep of dependentsOf(key)) next.delete(dep);
      } else {
        next.add(key);
        for (const req of requiredFor(key)) next.add(req);
      }
      return next;
    });
  };

  const setGroupAll = (group: PermissionGroup, on: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const perm of group.permissions) {
        if (on) {
          next.add(perm.key);
          for (const req of requiredFor(perm.key)) next.add(req);
        } else {
          next.delete(perm.key);
          for (const dep of dependentsOf(perm.key)) next.delete(dep);
        }
      }
      return next;
    });
  };

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setSelected(new Set(template.permissions));
    if (id !== "empty") {
      if (!name.trim() || templates.some((t) => t.name === name)) setName(template.name);
      if (!description.trim() || templates.some((t) => t.description === description)) setDescription(template.description);
    }
  };

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

  const openCreate = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setTemplateId("empty");
    setQuery("");
    setSelected(new Set());
    reveal();
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setTemplateId("empty");
    setQuery("");
    setSelected(new Set(role.permissions));
    reveal();
  };

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

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        permissions: g.group.toLowerCase().includes(q) ? g.permissions : g.permissions.filter((p) => p.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [groups, query]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const body = {
      name: name.trim(),
      description: description.trim(),
      permissions: [...selected],
      ...(editingId ? {} : { templateId }),
    };
    const result = editingId
      ? await restaurantService.updateRole(editingId, body)
      : await restaurantService.createRole(body);
    setBusy(false);
    if (!result.ok) {
      toast.error((result.data as { error?: string })?.error || "Could not save role.");
      return;
    }
    toast.success(editingId ? "Role updated." : "Role created.");
    closePanel();
    await load();
  };

  const remove = async (role: Role) => {
    if (role.staffCount > 0) {
      toast.error("Reassign staff before deleting this role.");
      return;
    }
    const result = await restaurantService.deleteRole(role.id);
    if (!result.ok) {
      toast.error((result.data as { error?: string })?.error || "Could not delete role.");
      return;
    }
    toast.success("Role deleted.");
    await load();
  };

  const groupSummary = (role: Role) => {
    const keys = new Set(role.permissions);
    return groups.filter((g) => g.permissions.some((p) => keys.has(p.key))).map((g) => g.group);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#C4622D]">
            <Link href="/dashboard/restaurant/staff">Staff</Link> / Roles
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#1C1410]">Roles</h2>
          <p className="mt-1 text-sm text-[#6B5A50]">Templates jump-start permissions; Empty lets you tick everything yourself.</p>
        </div>
        <button type="button" onClick={openCreate} className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white">
          New role
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B5A50]">Loading roles…</p>
      ) : roles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E7DDD2] bg-white px-4 py-10 text-center text-sm text-[#6B5A50]">No roles yet.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {roles.map((role) => {
            const chips = groupSummary(role);
            return (
              <article key={role.id} className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-[#1C1410]">{role.name}</p>
                    <p className="mt-1 text-sm text-[#6B5A50]">{role.description || `${role.permissions.length} permissions`}</p>
                    <p className="mt-2 text-xs text-[#8A7568]">{role.staffCount} staff · {role.permissions.length} grants</p>
                    {chips.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {chips.map((chip) => (
                          <span key={chip} className="rounded-full bg-[#F6F1EA] px-2 py-0.5 text-[11px] font-medium text-[#6B5A50]">{chip}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => openEdit(role)} className="cursor-pointer border-none bg-transparent text-sm font-semibold text-[#C4622D]">Edit</button>
                    <button type="button" onClick={() => void remove(role)} className="cursor-pointer border-none bg-transparent text-sm font-semibold text-[#8A7568]">Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={editingId ? "Edit role" : "Create role"}>
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
            onClick={closePanel}
          />
          <form
            onSubmit={(event) => void save(event)}
            className={`absolute inset-y-0 right-0 flex w-full max-w-[760px] flex-col bg-[#FBF8F4] shadow-2xl transition-transform duration-200 ease-out ${shown ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Header */}
            <header className="flex items-start justify-between gap-4 border-b border-[#E7DDD2] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C4622D]">{editingId ? "Edit role" : "New role"}</p>
                <h3 className="mt-0.5 text-xl font-semibold text-[#1C1410]">{editingId ? editingRole?.name : "Create role"}</h3>
                <p className="mt-1 text-sm text-[#6B5A50]">
                  {editingId
                    ? "Update what this role can see and do."
                    : "Define a role, then assign it to staff members."}
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E7DDD2] bg-white text-lg leading-none text-[#6B5A50] hover:bg-[#F6F1EA]"
              >
                ×
              </button>
            </header>

            {/* Body */}
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
              {editingRole && editingRole.staffCount > 0 ? (
                <div className="rounded-xl border border-[#F0D9B5] bg-[#FFF8EC] px-4 py-3 text-sm text-[#7A5418]">
                  {editingRole.staffCount} staff member{editingRole.staffCount === 1 ? "" : "s"} use this role. Changes apply to them immediately.
                </div>
              ) : null}

              {/* 1. Details */}
              <section>
                <SectionHeading step={1} title="Role details" hint="Name it by job, like “Kitchen lead” or “Floor manager”." />
                <div className="space-y-3 rounded-2xl border border-[#E7DDD2] bg-white p-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Role name <span className="text-[#C4622D]">*</span></span>
                    <input
                      required
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Floor manager"
                      className="h-11 w-full rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#1C1410] outline-none focus:border-[#1C1410]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-[#6B5A50]">Description</span>
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this role for? (optional)"
                      className="w-full resize-none rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-sm text-[#1C1410] outline-none focus:border-[#1C1410]"
                    />
                  </label>
                </div>
              </section>

              {/* 2. Template */}
              {!editingId ? (
                <section>
                  <SectionHeading step={2} title="Start from a template" hint="Pre-fills the permissions below. You can fine-tune everything afterwards." />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {templates.map((template) => {
                      const active = templateId === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template.id)}
                          aria-pressed={active}
                          className={`relative cursor-pointer rounded-xl border px-3.5 py-3 text-left transition ${active ? "border-[#1C1410] bg-white ring-1 ring-[#1C1410]" : "border-[#E7DDD2] bg-white hover:border-[#C9B8A6]"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[#1C1410]">{template.name}</p>
                            <span className="text-[11px] font-medium text-[#8A7568]">
                              {template.id === "empty" ? "Blank" : `${template.permissions.length} perms`}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#6B5A50]">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* 3. Permissions */}
              <section>
                <SectionHeading
                  step={editingId ? 2 : 3}
                  title="Permissions"
                  hint="Choose what this role can access. Edit actions automatically include viewing."
                  aside={
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setSelected(new Set(permMap.keys()))}
                        className="cursor-pointer border-none bg-transparent p-0 text-[#C4622D]"
                      >
                        Select all
                      </button>
                      <span className="text-[#D5C8BA]">|</span>
                      <button type="button" onClick={() => setSelected(new Set())} className="cursor-pointer border-none bg-transparent p-0 text-[#8A7568]">
                        Clear
                      </button>
                    </div>
                  }
                />

                <div className="mb-3 flex items-center gap-3">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search permissions…"
                    className="h-10 w-full rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm outline-none focus:border-[#1C1410]"
                  />
                  <span className="shrink-0 rounded-full bg-[#1C1410] px-3 py-1.5 text-xs font-semibold text-white">
                    {selected.size}/{totalPermissions}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredGroups.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#E7DDD2] bg-white px-4 py-6 text-center text-sm text-[#6B5A50]">No permissions match “{query}”.</p>
                  ) : null}
                  {filteredGroups.map((group) => {
                    const fullGroup = groups.find((g) => g.group === group.group) || group;
                    const count = fullGroup.permissions.filter((p) => selected.has(p.key)).length;
                    const all = count === fullGroup.permissions.length;
                    return (
                      <div key={group.group} className="overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white">
                        <div className="flex items-center justify-between gap-3 border-b border-[#F0E8DE] bg-[#FCFAF7] px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#1C1410]">{group.group}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${count > 0 ? "bg-[#1C1410] text-white" : "bg-[#F0E8DE] text-[#8A7568]"}`}>
                              {count}/{fullGroup.permissions.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGroupAll(fullGroup, !all)}
                            className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#C4622D]"
                          >
                            {all ? "Clear group" : "Select group"}
                          </button>
                        </div>
                        <div className="grid gap-2 p-3 sm:grid-cols-2">
                          {group.permissions.map((perm) => {
                            const checked = selected.has(perm.key);
                            const needs = (perm.implies || []).map((k) => permMap.get(k)?.label).filter(Boolean);
                            return (
                              <label
                                key={perm.key}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${checked ? "border-[#1C1410]/70 bg-[#F6F1EA]" : "border-[#E7DDD2] bg-white hover:border-[#C9B8A6]"}`}
                              >
                                <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(perm.key)} />
                                <span
                                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#C4622D] ${checked ? "border-[#1C1410] bg-[#1C1410] text-white" : "border-[#C9B8A6] bg-white text-transparent"}`}
                                >
                                  <CheckIcon />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-medium leading-snug text-[#1C1410]">{perm.label}</span>
                                  {needs.length > 0 ? (
                                    <span className="mt-0.5 block text-[11px] text-[#8A7568]">Includes: {needs.join(", ")}</span>
                                  ) : null}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7DDD2] bg-white px-5 py-3.5 sm:px-6">
              <p className="text-sm text-[#6B5A50]">
                <span className="font-semibold text-[#1C1410]">{selected.size}</span> of {totalPermissions} permissions
                {selected.size === 0 ? <span className="ml-2 text-xs text-[#B4531F]">No access granted</span> : null}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={closePanel} className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-5 text-sm font-semibold text-[#1C1410] hover:bg-[#F6F1EA]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Saving…" : editingId ? "Save changes" : "Create role"}
                </button>
              </div>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}
