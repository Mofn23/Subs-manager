import { SettingsView } from "./SettingsView";

export default function SettingsPage() {
  return <SettingsView initialUser={{ name: "Usuario", currency: "COP", monthlyBudget: 350000 }} />;
}
