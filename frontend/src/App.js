"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const sonner_1 = require("sonner");
const sonner_2 = require("@/components/ui/sonner");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const api_1 = require("@/lib/api");
function App() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [artists, setArtists] = (0, react_1.useState)(null);
    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const { access_token } = await api_1.api.login(email, password);
            api_1.auth.setToken(access_token);
            sonner_1.toast.success("Logged in");
            setArtists(await api_1.api.artists());
        }
        catch (err) {
            sonner_1.toast.error(err instanceof api_1.ApiError ? err.message : "Could not reach the API");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="mx-auto max-w-sm py-16">
      <sonner_2.Toaster />
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>TuneTrack</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label_1.Label htmlFor="email">Email</label_1.Label>
              <input_1.Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>
            <div className="flex flex-col gap-2">
              <label_1.Label htmlFor="password">Password</label_1.Label>
              <input_1.Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </div>
            <button_1.Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button_1.Button>
          </form>

          {artists && (<ul className="mt-6 flex flex-col gap-1 text-sm">
              {artists.map((artist) => (<li key={artist.id}>{artist.name}</li>))}
            </ul>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.default = App;
//# sourceMappingURL=App.js.map