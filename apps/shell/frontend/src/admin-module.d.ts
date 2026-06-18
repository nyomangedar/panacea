// Dev: the admin module's frontend is loaded via a Vite alias to its sibling repo.
// tsc resolves it through this ambient declaration (the real types live in panacea-admin).
declare module '@panacea-admin/frontend' {
  import type { ComponentType } from 'react';
  const Admin: ComponentType;
  export default Admin;
}
