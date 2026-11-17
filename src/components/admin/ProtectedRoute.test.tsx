// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const auth = vi.hoisted(() => ({ userId: null as string | null, role: null as string | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: auth.userId ? { user: { id: auth.userId } } : null },
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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

async function renderedText(userId: string | null, role: string | null): Promise<string> {
  auth.userId = userId;
  auth.role = role;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/admin/website-advantage"]}>
          <Routes>
            <Route path="/admin/login" element={<p>Login required</p>} />
            <Route path="/admin/website-advantage" element={
              <ProtectedRoute minRole="super_admin"><p>Super Admin content</p></ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>,
      );
      await Promise.resolve();
    });
    return container.textContent || "";
  } finally {
    await act(async () => { root.unmount(); });
    container.remove();
    auth.userId = null;
    auth.role = null;
  }
}

describe("Website Advantage route authorization (mocked UI guard)", () => {
  it("redirects signed-out visitors", async () => {
    expect(await renderedText(null, null)).toContain("Login required");
  });
  it.each(["user", "editor", "moderator", "admin"])("redirects authenticated %s", async role => {
    expect(await renderedText("test-user", role)).toContain("Login required");
  });
  it("permits the assigned super_admin role", async () => {
    expect(await renderedText("test-superadmin", "super_admin")).toContain("Super Admin content");
  });
  it("denies a signed-in user without an assigned role", async () => {
    expect(await renderedText("test-no-role", null)).toContain("Login required");
  });
});

/* These are simulated UI tests, not production authentication/RLS verification.
   Any future private API must separately enforce super_admin on the server. */
