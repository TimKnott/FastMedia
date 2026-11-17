// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const auth = vi.hoisted(() => ({ userId: null as string | null, role: null as string | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: {
        session: auth.userId ? { user: { id: auth.userId } } : null,
      } }),
      onAuthStateChange: () => ({ data: {
        subscription: { unsubscribe: () => {} },
      } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: auth.role ? { role: auth.role } : null }),
        }),
      }),
    }),
  },
}));

afterEach(() => {
  cleanup();
  auth.userId = null;
  auth.role = null;
});

function mount() {
  render(
    <MemoryRouter initialEntries={["/admin/website-advantage"]}>
      <Routes>
        <Route path="/admin/login" element={<p>Login required</p>} />
        <Route path="/admin/website-advantage" element={
          <ProtectedRoute minRole="super_admin"><p>Super Admin content</p></ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Website Advantage route authorization (UI guard)", () => {
  it("redirects signed-out visitors", async () => {
    mount();
    expect(await screen.findByText("Login required")).toBeTruthy();
    expect(screen.queryByText("Super Admin content")).toBeNull();
  });
  it.each(["user", "editor", "moderator", "admin"])("redirects an authenticated %s", async role => {
    auth.userId = "test-user";
    auth.role = role;
    mount();
    expect(await screen.findByText("Login required")).toBeTruthy();
    expect(screen.queryByText("Super Admin content")).toBeNull();
  });
  it("permits a verified super_admin role", async () => {
    auth.userId = "test-superadmin";
    auth.role = "super_admin";
    mount();
    expect(await screen.findByText("Super Admin content")).toBeTruthy();
  });
  it("denies a signed-in user without an assigned role", async () => {
    auth.userId = "test-no-role";
    auth.role = null;
    mount();
    expect(await screen.findByText("Login required")).toBeTruthy();
  });
});

/* This verifies the existing client-side route guard only. Backend data
   endpoints must separately enforce RLS and super_admin server-side. */
